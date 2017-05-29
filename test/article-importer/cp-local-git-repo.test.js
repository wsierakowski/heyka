//const test = require('tape');
const path = require('path');
const proxyquire = require('proxyquire');

const confStub = {
  app: {
    paths: {
      localRepoDir: path.join(__dirname, '../_sample-articles')
    }
  }
}

const CPLocalGitRepo = proxyquire('../../app/article-importer/cp-local-git-repo', {
  '../config': confStub
});
//const CPLocalGitRepo = require('./app/article-importer/cp-local-git-repo');
const cplgr = new CPLocalGitRepo();

cplgr.getArticleDirsContent(['conf', 'config'], ['json', 'yaml']);
