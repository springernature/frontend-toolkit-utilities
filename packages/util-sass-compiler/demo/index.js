'strict';

const path = require('path');
const render = require('../lib/js/render');

const sassData = `
	$width: 100px;
	.foo {
		width: $width;
	}`;

(async () => {
	try {
		const results = {
			data: await render({data: sassData}),
			css: await render({file: path.resolve(__dirname, '../__tests__/unit/lib/scss/css.css')}),
			mixin: await render({file: path.resolve(__dirname, '../__tests__/unit/lib/scss/mixin.scss')}),
			function: await render({file: path.resolve(__dirname, '../__tests__/unit/lib/scss/function.scss')})
		};

		for (const key in results) {
			if (Object.prototype.hasOwnProperty.call(results, key)) {
				console.log(`${key}: ${results[key].css}`);
			}
		}
	} catch (error) {
		throw new Error(error.message);
	}
})();
