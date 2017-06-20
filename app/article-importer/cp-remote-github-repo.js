const path = require('path');
const Octokat = require('octokat');

const ContentProviderInterface = require('./cp-interface');

class ContentProviderRemoteGithubRepo extends ContentProviderInterface {
  constructor(rootPath, remoteRepoOwner, remoteRepoName) {
    super(rootPath);
    const octo = new Octokat();
    this.repo = octo.repos(remoteRepoOwner, remoteRepoName);

    // TODO: implement caching so that git.trees doesn't have to be called multiple times
    // unless octokat itself does caching?
  }

  getPathsToFiles(dir, fileNamesList, fileExtsList, cb) {
    // get tree recursively
    this.repo.git.trees('master?recursive=1').read((err, res) => {
      if (err) {
        return cb(err);
      }
      if (!res.tree || res.tree.length === 0) {
        return cb('No config files found');
      }

      // As per info at: https://developer.github.com/v3/git/trees/
      // we want to remove anything that isn't a file from the results

      const confFiles = res.tree
        .filter(item => item.type === 'blob')
        .map(item => item.path)
        .filter(file => {
          const parsed = path.parse(file);
          const fileName = parsed.name;
          const fileExt = parsed.ext ? parsed.ext.slice(1) : parsed.ext;
          const fileNameMatch = fileNamesList.indexOf(fileName) !== -1;
          const fileExtMatch = fileExtsList.indexOf(fileExt) !== -1;
          return fileNameMatch && fileExtMatch;
        });
      if (confFiles.length === 0) {
        return cb('No config files found');
      }
      cb(null, confFiles);
    });
  }
}

module.exports = ContentProviderRemoteGithubRepo;
