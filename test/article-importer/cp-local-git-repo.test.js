const test = require('tape');
const path = require('path');

const CPLocalGitRepo = require('../../app/article-importer/cp-local-git-repo');
//const proxyquire = require('proxyquire');

const confStub = {
  app: {
    paths: {
      localRepoDir: path.join(__dirname, '../_sample-articles')
    }
  }
}

// const CPLocalGitRepo = proxyquire('../../app/article-importer/cp-local-git-repo', {
//   '../config': confStub
// });

test('contentProvider.getPathsToFiles should return paths', function(t) {
  const expected = require('./cp-local-git-repo.fixture.js');
  const expectedPaths = expected.map(o => path.relative(confStub.app.paths.localRepoDir, o.dirPath));

  const cp = new CPLocalGitRepo(confStub.app.paths.localRepoDir);

  cp.getPathsToFiles(null, ['conf', 'config'], ['json', 'yaml'], (err, result) => {
    // todo - error?

    //result.forEach(item => item.dirPath = path.relative(confStub.app.paths.localRepoDir, item.dirPath));
    console.log('==---- results ---==');
    console.log('err', err);
    console.log('res', result);
    console.log('');
    console.log('expectedPaths', expectedPaths);

     t.equal(result, expected);
    //t.equal(true, true);
    t.end();
  });
});
