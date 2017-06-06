const test = require('tape');
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

test('ContentProvider.getArticleDirsContent should return correct objects', function(t) {
  const expected = require('./cp-local-git-repo.fixture.js');

  CPLocalGitRepo.GetArticleDirsContent(['conf', 'config'], ['json', 'yaml'], (err, result) => {
    // todo - error?

    result.forEach(item => item.dirPath = path.relative(confStub.app.paths.localRepoDir, item.dirPath));
    // console.log('==---- results ---==');
    // console.log('err', err);
    // console.log('res', result);

     t.deepEqual(result, expected);
    //t.equal(true, true);
    t.end();
  });
});
