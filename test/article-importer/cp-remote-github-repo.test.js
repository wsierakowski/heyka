const test = require('tape');
const path = require('path');
const stream = require('stream');
const proxyquire = require('proxyquire');

//const CPRemoteGithubRepo = require('../../app/article-importer/cp-remote-github-repo');

const confStub = {
  app: {
    paths: {
      // localRepoDir: path.join(__dirname, '../_sample-articles'),
      remoteRepoOwner: 'wsierakowski',
      remoteRepoName: 'demo-content'
    }
  }
}

const fsStub = {};

const CPRemoteGithubRepo = proxyquire('../../app/article-importer/cp-remote-github-repo', {
  'fs-extra': fsStub
});

// TODO: test also with err scneario and dir
if (1)
test('contentProvider.getPathsToFiles should return paths to conf files', function(t) {
  const expectedPaths = require('./cp-local-git-repo.fixture.js').confFiles;
  const cp = new CPRemoteGithubRepo(
    '',
    confStub.app.paths.remoteRepoOwner,
    confStub.app.paths.remoteRepoName
  );

  cp.getPathsToFiles(null, ['conf', 'config'], ['json', 'yaml'], (err, fpaths) => {
    // todo - error?

    //fpaths = fpaths.map(fpath => path.relative(confStub.app.paths.localRepoDir, fpath));
    // console.log('==---- results ---==');
    // console.log('err', err);
    // console.log('fpaths', fpaths);
    // console.log('');
    // console.log('expectedPaths', expectedPaths);

    t.deepEqual(fpaths, expectedPaths);
    //t.equal(true, true);
    t.end();
  });
});

if(1)
test('contentProvider.getPathsToFiles should return paths to all files', function(t) {
  const expectedPaths = require('./cp-local-git-repo.fixture.js').allFiles;
  const cp = new CPRemoteGithubRepo(
    '',
    confStub.app.paths.remoteRepoOwner,
    confStub.app.paths.remoteRepoName
  );

  cp.getPathsToFiles(null, null, null, (err, fpaths) => {
    //fpaths = fpaths.map(fpath => path.relative(confStub.app.paths.localRepoDir, fpath));
    t.deepEqual(fpaths, expectedPaths);
    t.end();
  });
});

// TODO: create a test to fetch content inside a directory
if(0)
test('contentProvider.getPathsToFiles should return paths to all files', function(t) {
  const expectedPaths = require('./cp-local-git-repo.fixture.js').allFiles;
  const cp = new CPRemoteGithubRepo(
    '',
    confStub.app.paths.remoteRepoOwner,
    confStub.app.paths.remoteRepoName
  );

  cp.getPathsToFiles(null, null, null, (err, fpaths) => {
    //fpaths = fpaths.map(fpath => path.relative(confStub.app.paths.localRepoDir, fpath));
    t.deepEqual(fpaths, expectedPaths);
    t.end();
  });
});

if(1)
test('contentProvider.readFile should return content of a file', function(t) {
  const fileToRead = require('./cp-local-git-repo.fixture.js').sampleConfigFile;
  const cp = new CPRemoteGithubRepo(
    '',
    confStub.app.paths.remoteRepoOwner,
    confStub.app.paths.remoteRepoName
  );

  cp.readFile(fileToRead.filePath, (err, data) => {
    const expectedContent = JSON.parse(fileToRead.fileContent);
    const actualContent = JSON.parse(data);

    t.deepEqual(expectedContent, actualContent);
    t.end();
  });
});

if(1)
test('contentProvider.copyFile should copy content of a file to a destination', function(t) {
  const fileToRead = require('./cp-local-git-repo.fixture.js').sampleConfigFile;
  const cp = new CPRemoteGithubRepo(
    '',
    confStub.app.paths.remoteRepoOwner,
    confStub.app.paths.remoteRepoName
  );
  const destPath = './somepath/filename.json';

  fsStub.outputFile = (path, content, cb) => {
    t.equal(path, destPath);
    t.deepEqual(JSON.parse(content), JSON.parse(fileToRead.fileContent));
    cb(null);
  };

  cp.copyFile(fileToRead.filePath, destPath, (err) => {
    t.ifError(err, 'Copy file error');
    t.end();
  });
});
