const path = require('path');
const glob = require('glob');
const async = require('async');

const conf = require('../config');
const ContentProviderInterface = require('./cp-interface');

class ContentProviderLocalGitRepo extends ContentProviderInterface {
  constructor() {}

  static GetArticleInfo(confFileNamesList, confFileExtsList, cb) {
    // ?(conf|config)
    const filenames = confFileNamesList.join('|');

    // .{json,yaml}
    const exts = confFileExtsList.join(',');

    const globPath = path.join(conf.app.paths.localRepoDir, '**', `?(${filenames})`) + `.{${exts}}`;

    // 1. Search through all directories and identify those that have conf files.
    glob(globPath, (gperr, confPaths) => {
      if (gperr) return cb(gperr);

      // 2. Go through each directory identified as article dir and list the files inside.
      //const ret = [];
      async.map(confPaths, getArticleContent, (cferr, res) => {
        if (cferr) return cb(cferr);
        cb(null, res);
      });
    });

    function getArticleContent(confPath, cb1) {
      const dirContent = {
        dirPath: path.dirname(confPath),
        confFile: path.basename(confPath)
      };
      const articleGlobPath = path.join(dirContent.dirPath, '**', '*.*');
      glob(articleGlobPath, (agerr, articleFiles) => {
        if (agerr) return cb1(agerr);
        articleFiles = articleFiles
          .map(file => path.relative(dirContent.dirPath, file))
          .filter(file => file !== dirContent.confFile);
        dirContent.staticFiles = articleFiles;
        //ret.push(dirContent);
        cb1(null, dirContent);
      });
    };
  }
}

module.exports = ContentProviderLocalGitRepo;
