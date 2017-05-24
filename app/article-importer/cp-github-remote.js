const ContentProviderInterface = require('./cp-interface');

class ContentProviderGithubRemote extends ContentProviderInterface {
  constructor(name) {
    super(name);
  }

  getArticleDirsContent(confFileNamesList, confFileExtsList, cb) {}
}
