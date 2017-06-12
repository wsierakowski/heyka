const test = require('tape');
const path = require('path');
const stream = require('stream');
const proxyquire = require('proxyquire');

//const CPLocalGitRepo = require('../../app/article-importer/cp-local-git-repo');

const confStub = {
  app: {
    paths: {
      localRepoDir: path.join(__dirname, '../_sample-articles')
    }
  }
}

const fsStub = {};

const CPLocalGitRepo = proxyquire('../../app/article-importer/cp-local-git-repo', {
  'fs-extra': fsStub
});

// TODO: test also with err scneario and dir
if (1)
test('contentProvider.getPathsToFiles should return paths to conf files', function(t) {
  const expectedPaths = require('./cp-local-git-repo.fixture.js').confFiles;
  const cp = new CPLocalGitRepo(confStub.app.paths.localRepoDir);

  cp.getPathsToFiles(null, ['conf', 'config'], ['json', 'yaml'], (err, fpaths) => {
    // todo - error?

    fpaths = fpaths.map(fpath => path.relative(confStub.app.paths.localRepoDir, fpath));
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
  const cp = new CPLocalGitRepo(confStub.app.paths.localRepoDir);

  cp.getPathsToFiles(null, null, null, (err, fpaths) => {
    fpaths = fpaths.map(fpath => path.relative(confStub.app.paths.localRepoDir, fpath));
    t.deepEqual(fpaths, expectedPaths);
    t.end();
  });
});

if(1)
test('contentProvider.readFile should return content of a file', function(t) {
  const fileToRead = require('./cp-local-git-repo.fixture.js').sampleConfigFile;
  const cp = new CPLocalGitRepo(confStub.app.paths.localRepoDir);

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
  const cp = new CPLocalGitRepo(confStub.app.paths.localRepoDir);
  const destPath = './somepath';
  let pipedFile = '';

  //https://stackoverflow.com/questions/21491567/how-to-implement-a-writable-stream
  const ws = new stream.Writable();
  ws._write = (chunk, encoding, done) => {
    pipedFile += chunk.toString();
    done();
  };

  fsStub.createWriteStream = (filePath) => {
    t.equal(filePath, destPath);
    return ws;
  };

  cp.copyFile(fileToRead.filePath, destPath, (err) => {
    //console.log('____2. This is what i got: ', pipedFile);
    t.deepEqual(JSON.parse(fileToRead.fileContent), JSON.parse(pipedFile));
    t.end();
  });
});
