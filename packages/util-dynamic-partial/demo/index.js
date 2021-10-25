const Handlebars = require('handlebars');
const dynamicPartials = require('../lib/js');
const config = require('./context.json');

(async () => {
	try {
		// Register all dynamic partials
		await dynamicPartials(Handlebars, config.dynamicPartials, './packages/util-dynamic-partial/demo');

		// compile the template
		const template = Handlebars.compile('<h1>Title</h1><div>{{> partialName }}{{> otherPartialName }}</div>');

		// execute the compiled template and print the output to the console
		console.log(template(config));
	} catch (error) {
		console.error(error);
	}
})();
