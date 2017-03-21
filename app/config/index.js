const staticConf = require('./static-config');
const appConf = require('./app-config');

const conf = Object.assign({}, staticConf);
conf.app = appConf;

module.exports = conf;
