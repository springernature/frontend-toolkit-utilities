const render = require('./lib/js/render'); // eslint-disable-line unicorn/import-index
const path = require('path');

const packageJsonPath = path.join(path.resolve(__dirname), './__mocks__/apackage/');
render(packageJsonPath);
