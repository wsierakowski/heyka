const Octokat = require('octokat');

const ContentProviderInterface = require('./cp-interface');

class ContentProviderGithubRemote extends ContentProviderInterface {
  constructor(rootPath) {
    super(rootPath);
    const octo = new Octokat();
    this.repo = octo.repos('wsierakowski', 'demo-content');

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
      const confFiles = res.tree
        .map(item => item.path)
        .filter(file => {
          const fileName = path.base(file);
          const fileExt = path.extname(file);
          const fileNameMatch = fileNamesList.filter(fname => fname === 'fileName');
          const fileExtMatch = fileExtsList.filter(fext => fext === fileExt);
          return fileNameMatch && fileExtMatch;
        });
      if (confFiles.length === 0) {
        return cb('No config files found');
      }
      cb(null, confFiles);
    });
  }
}
