/**
 * _get-remote-file.js
 * Get the contents of a remote file
 * Used to get package contents from CDN
 * HTTPS only
 */
'use strict';

const got = require('got');

// Number of times to retry request
// Retry on the following:
// statusCodes: 408 413 429 500 502 503 504
// errorCodes: ETIMEDOUT ECONNRESET EADDRINUSE ECONNREFUSED EPIPE ENOTFOUND ENETUNREACH EAI_AGAIN
const maxRetry = 2;

/**
 * Generate an error message based on error type
 * @param {Object} error the error object from the request
 * @return {String}
 */
function generateErrorMessage(error) {
	switch (error.name) {
		case 'RequestError':
			return `request failed with ${error.code}`;
		case 'ParseError':
		case 'HTTPError':
		case 'MaxRedirectsError':
			return `${error.statusCode} (${error.statusMessage})`;
		default:
			return `Uh-oh Something went wrong`;
	}
}

/**
 * Get contents of a file from a URL
 * Retry on failure <maxRetry>
 * @param {String} url the request
 * @return {Promise<Object>}
 */
function getRemoteFile(url) {
	return new Promise((resolve, reject) => {
		(async () => {
			try {
				const response = await got(url, {
					retry: maxRetry,
					hooks: {
						beforeRetry: [
							(_options, error, retryCount) => {
								console.log(`fail: requesting ${url}`);
								console.log(`info: ${generateErrorMessage(error)}`);
								console.log(`info: retrying (${retryCount}/${maxRetry})`);
							}
						]
					}
				});
				resolve(response.body);
			} catch (error) {
				console.log(`fail: requesting ${url}`);
				reject(new Error(`${generateErrorMessage(error)}`));
			}
		})();
	});
}

module.exports = getRemoteFile;
