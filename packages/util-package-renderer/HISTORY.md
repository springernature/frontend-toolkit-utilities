# History

## 3.3.1 (2022-09-20)
    * BUG: Don't try and inline when svg is already in the page (referenced by just a hash)

## 3.3.0 (2022-09-15)
    * FEATURE: Adds support for inlining SVGs that are referenced with the use directive

## 3.2.0 (2022-02-14)
    * FEATURE: Adds viewport meta tag to demo template for responsive layout

## 3.1.0 (2022-01-25)
    * FEATURE: Add `.js` class to output `html` element

## 3.0.1 (2022-01-25)
    * BUG: hyperlink check did not cater for protocol relative URLs

## 3.0.0 (2022-01-11)
    * BREAKING: update to dart-sass
    * For node-sass continue using v2.2.2

## 2.2.2 (2022-01-06)
    * Update util-package-installer & util-dynamic-partial

## 2.2.1 (2021-11-26)
    * Update util-cli-reporter

## 2.2.0 (2021-11-26)
    * FEATURE: ignore hyperlinks when converting images

## 2.1.1 (2021-11-25)
    * BUG: can't use devDependencies

## 2.1.0 (2021-11-25)
    * FEATURE: convert images to data-uri in demo folder

## 2.0.0 (2021-10-25)
    * FEATURE: add new dependency on `util-dynamic-partial`
        * Look for dynamic partials and render them with the demo

## 1.0.1 (2021-09-13)
    * BUG: Update readme and example with below features

## 1.0.0 (2021-09-09)
    * In production use for some time so create the first major version
    * Includes the following NEW FEATURES:
        * Support different module import methods
        * Locate modules using the Node resolution algorithm, for using third party modules in node_modules
        * Transpile javascript and export as IIFE (Immediately Invoked Function Expression)
        * Optional minification of JS and CSS

## 0.0.4 (2020-10-06)
    * Code style changes
	* Better reporting

## 0.0.3 (2020-10-05)
    * BUG: Switches to package dir and now switches back to cwd for better integration

## 0.0.2 (2020-10-01)
    * BUG: Incorrect use of `files` field meant nothing was published

## 0.0.1 (2020-09-23)
    * Experimental working version

## 0.0.0 (2019-07-04)
    * Initial commit
