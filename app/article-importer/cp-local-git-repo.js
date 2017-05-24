const ContentProviderInterface = require('./cp-interface');

class ContentProviderLocalGitRepo extends ContentProviderInterface {
  constructor(name) {
    super(name);
  }

  getArticleDirsContent(confFileNamesList, confFileExtsList, cb) {}
}
