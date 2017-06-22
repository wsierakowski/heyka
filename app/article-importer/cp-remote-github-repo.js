const path = require('path');
const Octokat = require('octokat');
const fse = require('fs-extra');

const ContentProviderInterface = require('./cp-interface');

class ContentProviderRemoteGithubRepo extends ContentProviderInterface {
  constructor(rootPath, remoteRepoOwner, remoteRepoName) {
    super(rootPath);
    const octo = new Octokat();
    this.repo = octo.repos(remoteRepoOwner, remoteRepoName);
    this.repoTreeCache = null;

    // TODO: implement caching so that git.trees doesn't have to be called multiple times
    // unless octokat itself does caching?
  }

  getPathsToFiles(dir, fileNamesList, fileExtsList, cb) {
    // get tree recursively
    // https://api.github.com/repos/wsierakowski/demo-content/git/trees/fc5432c34d7751633fe9eab005b7e2f0c54dfb52
    if (!this.repoTreeCache) {
      this.repo.git.trees('master?recursive=1').read((err, res) => {
        if (err) {
          return cb(err);
        }
        if (!res.tree || res.tree.length === 0) {
          return cb('No config files found');
        }
        this.repoTreeCache = res.tree;
        this._findMatchesInTree(dir, fileNamesList, fileExtsList, cb);
      });
    } else {
      this._findMatchesInTree(dir, fileNamesList, fileExtsList, cb);
    }
  }

  _findMatchesInTree(dir, fileNamesList, fileExtsList, cb) {
    if (!this.repoTreeCache) return cb('Oops... Repo tree cache not available.');
    // As per info at: https://developer.github.com/v3/git/trees/
    // we want to remove anything that isn't a file from the results

    let retPaths = this.repoTreeCache;
    if (dir) {
      retPaths = retPaths.filter(item => item.path.indexOf(dir) !== -1)
    }
    retPaths = retPaths
      .filter(item => item.type === 'blob')
      .map(item => item.path)
      .filter(file => {
        const parsed = path.parse(file);

        let fileNameMatch = false;
        if (fileNamesList === null) {
          fileNameMatch = true;
        } else {
          fileNameMatch = fileNamesList.indexOf(parsed.name) !== -1;
        }

        let fileExtMatch = false;
        if (fileExtsList === null) {
          fileExtMatch = true;
        } else {
          const fileExt = parsed.ext ? parsed.ext.slice(1) : parsed.ext;
          fileExtMatch = fileExtsList.indexOf(fileExt) !== -1;
        }

        return fileNameMatch && fileExtMatch;
      });

    if (retPaths.length === 0) {
      return cb('No config files found');
    }
    cb(null, retPaths);
  }

  readFile(filePath, cb) {
    // TODO: ideally if we could do this with streams here as well
    const fpath = path.join(this.rootPath, filePath);
    this.repo.contents(fpath).read(cb);
  }

  // in this case we want to read from remote and save to a local file
  copyFile(sourcePath, destinationPath, cb) {
    // TODO: ideally if we could do this with streams here as well
    const spath = path.join(this.rootPath, sourcePath);
    const destDir = path.dirname(destinationPath);

    this.readFile(sourcePath, (err, content) => {
      if (err) return cb(err);
      fse.outputFile(destinationPath, content, oferr => {
        cb(oferr);
      });
    });

    // async.waterfall([
    //   function ensureDir(cb) {
    //     fse.ensureDir(destDir, cb);
    //   },
    //   function readFile(cb) {
    //     this.readFile(sourcePath, cb);
    //   },
    //   function writeFile(sourceContent, cb) {
    //     fse.writeFile(destinationPath, sourceContent, cb);
    //   }
    // ], (err, res) => {
    //   if (err) return cb(err);
    //   cb(null);
    // });
  }

}

module.exports = ContentProviderRemoteGithubRepo;
