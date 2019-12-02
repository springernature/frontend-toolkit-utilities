/**
 * __mocks__/_manage-peer-deps.js
 * Mocks finding and configuring peer dependencies
 */
'use strict';

const formatPeerDeps = peerDependencies => {
	if (peerDependencies && peerDependencies['name-of-package']) {
		return '"name-of-package@1.0.0"';
	}
	if (peerDependencies && peerDependencies['name-of-failed-package']) {
		return '"name-of-failed-package@2.0.0"';
	}
	return '';
};

const checkForPeerDeps = async (packagePath, _rootPath) => {
	if (packagePath.includes('name-of-package')) {
		return {
			'name-of-package': '1.0.0'
		};
	}
	if (packagePath.includes('name-of-failed-package')) {
		return {
			'name-of-failed-package': '2.0.0'
		};
	}
	if (packagePath.includes('name-of-no-deps-package')) {
		throw new Error('no peerDependencies');
	}
	return {};
};

module.exports = {
	formatPeerDeps,
	checkForPeerDeps
};
