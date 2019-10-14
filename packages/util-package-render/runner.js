const path = require('path');
const render = require('./lib/js/render'); // eslint-disable-line unicorn/import-index

const workdir = './__mocks__/apackage/';
const fulldir = path.join(path.resolve(__dirname), workdir);
process.chdir(fulldir);

render(fulldir);
