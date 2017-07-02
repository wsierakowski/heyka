const path = require('path');
const Octokat = require('octokat');
const fse = require('fs-extra');
const https = require('https');
const conf = require('../config');

function requestLogger(httpModule){
    var original = httpModule.request
    httpModule.request = function(options, callback){
      console.log('**', options.href||options.proto+"://"+options.host+options.path, options.method)
      console.log(options.url);
      return original(options, callback)
    }
}

requestLogger(require('http'))
requestLogger(require('https'))

const ContentProviderInterface = require('./cp-interface');

class ContentProviderRemoteGithubRepo extends ContentProviderInterface {
  constructor(rootPath, remoteRepoOwner, remoteRepoName) {
    super(rootPath);
    this.remoteRepoName = remoteRepoOwner;
    this.remoteRepoOwner = remoteRepoName;
    const credentials = {
      //username: process.env.GITHUB_USER,
      //password: process.env.GITHUB_PASS
      token: process.env.GITHUB_TOKEN
    };
    const octo = new Octokat(credentials);
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
    if (dir) {
      retPaths = retPaths.map(filePath => path.relative(dir, filePath));
    }
    cb(null, retPaths);
  }

  readFile(filePath, asBuffer, cb) {
    //const fpath = path.join(this.rootPath, filePath);
    //this.repo.contents(fpath).read(cb);

    if (typeof asBuffer === 'function' ) {
      cb = asBuffer;
      asBuffer = false;
    }

    const getOptions = {
      host: 'api.github.com',
      port: '443',
      method: 'GET',
      path: `/repos/${conf.REPO_REMOTE_OWNER}/${conf.REPO_REMOTE_NAME}/contents/${filePath}`,
      headers: {
        'User-Agent': 'heyka',
        'Authorization': 'token ' + process.env.GITHUB_TOKEN,
        'accept': 'application/json'
      }
    };
    const req = https.request(getOptions, res => {
      let body = '';
      res.on('data', d => body += d);
      res.on('end', () => {
        if (!body) return cb(`Empty body for ${sourcePath}.`);
        let parsed;
        try {
          parsed = JSON.parse(body);
        } catch (e) {
          return cb(`Error parsing body for ${sourcePath}.`)
        }
        if (!parsed) return cb(`Empty body for ${sourcePath}.`);
        const b64string = parsed.content;
        let ret = Buffer.from(b64string, 'base64');
        if (!asBuffer) ret = ret.toString();
        cb(null, ret);
      });
    });
    req.once('error', err => {
      return cb(err);
    });
    req.end();
  }

  // in this case we want to read from remote and save to a local file
  copyFile(sourcePath, destinationPath, cb) {
    // TODO: ideally if we could do this with streams here as well
    //const spath = path.join(this.rootPath, sourcePath);
    const destDir = path.dirname(destinationPath);

    this.readFile(sourcePath, true, (err, buf) => {
      if (err) return cb(err);

      fse.outputFile(destinationPath, buf, 'binary', ofErr => {
        cb(ofErr);
      });
    });
  }

}

module.exports = ContentProviderRemoteGithubRepo;
