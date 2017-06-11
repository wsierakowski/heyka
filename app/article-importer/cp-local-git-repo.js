const fse = require('fs-extra');
const path = require('path');
const glob = require('glob');
const async = require('async');

const ContentProviderInterface = require('./cp-interface');

class ContentProviderLocalGitRepo extends ContentProviderInterface {
  constructor(rootPath) {
    super(rootPath);
  }

  getPathsToFiles(dir, fileNamesList, fileExtsList, cb) {
    // ?(conf|config)

    let filenames = fileNamesList === null ? '*' : fileNamesList;
    filenames = Array.isArray(filenames) ? `?(${filenames.join('|')})` : filenames;

    // .{json,yaml}
    let exts = fileExtsList === null ? '*' : fileExtsList;
    exts = Array.isArray(exts) ? `{${exts.join(',')}}` : exts;

    const root = dir ? path.join(this.rootPath, dir) : this.rootPath;

    const globPath = path.join(root, '**', filenames + `.${exts}`);
    console.log('-------globPath', globPath);
    // 1. Search through all directories and identify those that have conf files.
    glob(globPath, (gperr, confPaths) => {
      if (gperr) return cb(gperr);
      cb(null, confPaths);
    });
    //   // 2. Go through each directory identified as article dir and list the files inside.
    //   //const ret = [];
    //   async.map(confPaths, getArticleContent, (cferr, res) => {
    //     if (cferr) return cb(cferr);
    //     cb(null, res);
    //   });
    // });
    //
    // function getArticleContent(confPath, cb1) {
    //   const dirContent = {
    //     dirPath: path.dirname(confPath),
    //     confFile: path.basename(confPath)
    //   };
    //   const articleGlobPath = path.join(dirContent.dirPath, '**', '*.*');
    //   glob(articleGlobPath, (agerr, articleFiles) => {
    //     if (agerr) return cb1(agerr);
    //     articleFiles = articleFiles
    //       .map(file => path.relative(dirContent.dirPath, file))
    //       .filter(file => file !== dirContent.confFile);
    //     dirContent.staticFiles = articleFiles;
    //     //ret.push(dirContent);
    //     cb1(null, dirContent);
    //   });
    // };
  }

  readFile(filePath, cb) {
    // doing streams here just as an excercise...
    const fpath = path.join(this.rootPath, filePath);
    let content = '';
    fse.createReadStream(fpath)
      .on('data', chunk => content += chunk)
      .once('end', () => cb(null, content))
      .once('error', err => cb(err));
  }

  copyFile(sourcePath, destinationPath, cb) {
    // doing streams here just as an excercise...
    const spath = path.join(this.rootPath, sourcePath);
    const rs = fse.createReadStream(spath);
    const ws = fse.createWriteStream(destinationPath);

    rs
      .once('end', () => cb(null))
      .once('error', err => cb(err));

    rs.pipe(ws);
    cb(null);
  }
}

module.exports = ContentProviderLocalGitRepo;
