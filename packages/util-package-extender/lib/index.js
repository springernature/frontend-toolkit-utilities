/**
 * Package Extender
 * Check if a package needs extending & extend
 */
'use strict';

/**
 * Does this package require extension
 * @param {Object} json
 * @return {Boolean}
 */
const requireExtension = json => {
	return Object.prototype.hasOwnProperty.call(json, 'extendsPackage');
};

/**
 * Extend a package
 * @param {String} packageToExtend
 * @param {String} dir
 * @return {Promise<Object>}
 */
const extendPackage = (packageToExtend, directory) => {
	console.log(packageToExtend);
	console.log(directory);
	return false;
};

export default {
	requireExtension,
	extendPackage
};
