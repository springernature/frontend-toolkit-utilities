'use strict';
// https://docs.npmjs.com/files/package.json#dependencies
// the valid version ranges npm accepts are... eurgh. just, urgh.

// things we really don't want passed to /bin.sh
//  1) yes we should define allow lists, not ban lists, but we are doing both
//		because mistakes happen
//  2) shell expansion etc. tests _should_ now be redundant after refactoring the code
//		from using child_process.exec to child_process.spawn...
//		but these tests are quick to run, and no harm double-checking.

const badThingsToPassToBinSh = [
	'1.0;',
	'"quotes"',
	'1.0.0\\stuff',
	'*.js'
];

const harmlessNames = [
	'a',
	'b',
	'c',
	'd'
];

const harmlessValues = [
	'1',
	'2',
	'3',
	'4'
];

const badNames = Object.assign(...badThingsToPassToBinSh.map((k, i) => ({[k]: harmlessValues[i]})));
const badValues = Object.assign(...harmlessNames.map((k, i) => ({[k]: badThingsToPassToBinSh[i]})));

const oneValidDependency = {
	foo: '1.0.0 - 2.9999.9999'
};

module.exports = {
	badNames,
	badValues,
	oldStyleNPMDependencies: {
		'eLaBorAtE-paCkAgE-with-mixed-case-and-more-than-214-characters-----------------------------------------------------------------------------------------------------------------------------------------------------------': '0.0.0'
	},

	oneValidDependency: oneValidDependency,

	oneKnownToThrowDependency: {
		ohno: '666'
	},

	twoValidDependencies: {
		foo: '1.0.0 - 2.9999.9999',
		bar: '>=1.0.2 <2.1.2'
	},

	npmExampleDependencies: {
		foo: '1.0.0 - 2.9999.9999',
		bar: '>=1.0.2 <2.1.2',
		baz: '>1.0.2 <=2.3.4',
		boo: '2.0.1',
		qux: '<1.0.0 || >=2.3.1 <2.4.5 || >=2.5.2 <3.0.0',
		asd: 'http://asdf.com/asdf.tar.gz',
		til: '~1.2',
		elf: '~1.2.3',
		two: '2.x',
		thr: '3.3.x',
		lat: 'latest',
		dyl: 'file:../dyl'
	},

	packageJSON: {
		dependencies: oneValidDependency,
		devDependencies: oneValidDependency,
		peerDependencies: oneValidDependency
	}

};
