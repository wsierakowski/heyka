const path = require('path');
const glob = require('glob');

const conf = require('../config');
const ContentProviderInterface = require('./cp-interface');

class ContentProviderLocalGitRepo extends ContentProviderInterface {
  constructor(name) {
    super(name);
  }

  getArticleDirsContent(confFileNamesList, confFileExtsList, cb) {
    // ?(conf|config)
    const filenames = confFileNamesList.join('|');

    // .{json,yaml}
    const exts = confFileExtsList.join(',');

    const globPath = path.join(conf.app.paths.localRepoDir, '**', `?(${filenames})`) + `.{${exts}}`;
    console.log('**>', globPath)

    // 1. Search through all directories and identify those that have conf files.
    glob(globPath, (err, confPaths) => {
      if (err) return cb(err);

      // 2. Go through each directory identified as article dir and list the files inside.
      const ret = [];
      console.log('---->', confPaths);
      //async.each(confPaths, (confPath, cb1) => {
        //const globArticleDir = path.join(confPaths);
      //});
    });
  }
}

module.exports = ContentProviderLocalGitRepo;
