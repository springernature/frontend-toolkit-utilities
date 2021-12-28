/**
 * index.js
 * Logging demo
 */
'use strict';

const reporter = require('../lib/js/reporter');

reporter.init('title');

reporter.title('this is a heading');

reporter.info('description');
reporter.info('description', 'this is my message');
reporter.info('description', 'this is my message', 'to you');

reporter.success('description');
reporter.success('description', 'this is my message');
reporter.success('description', 'this is my message', 'to you');

reporter.warning('description');
reporter.warning('description', 'this is my message');
reporter.warning('description', 'this is my message', 'to you');

reporter.fail('description');
reporter.fail('description', 'this is my message');
reporter.fail('description', 'this is my message', 'to you');
