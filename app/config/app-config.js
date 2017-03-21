const path = require('path');
const os = require('os');
const moment = require('moment');

const myUtils = require('../libs/my-utils');

const staticConf = require('./static-config');


let blogPaths;

class AppConfig {
  constructor() {}
  static get paths() {
    if (!blogPaths) {
      blogPaths = {};
      blogPaths.localRepoDir = path.join(process.cwd(), staticConf.ARTICLES_DIR_PATH);
      blogPaths.tempDir = path.join(os.tmpdir(), myUtils.slugify(staticConf.BLOG_TITLE));
      blogPaths.staticFilesPrefix = path.join(blogPaths.tempDir, staticConf.STATIC_FILES_DIR_PREFIX);
      blogPaths.staticFilesDir = path.join(blogPaths.staticFilesPrefix + moment().toArray().join('-'));
    }
    return blogPaths;
  }
}

module.exports = AppConfig;
