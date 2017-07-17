const simpleGit = require('simple-git');
const os = require('os');
const path = require('path');
const fs = require('fs-extra');

// prototyping...
// this is going to be the init method called on launch:

// fs operations here are synchronous as this is only done once at the launch
// git operations are async as the API is async

// TODO modularize steps

function gitPullLocally(repoPathLocal, repoPathRemote, cb) {
  // 1. get OS temp directory
  const tempdir = repoPathLocal;//path.join(os.tmpdir(), repoPathLocal);
  console.log('* 1. This is the tempdir we are going to use:', tempdir);

  // 2. check if directory exists, if not create a new one
  let tempdirExists = true;
  try {
    fs.accessSync(tempdir, fs.constants.R_OK | fs.constants.W_OK);
  } catch (err) {
    if (err.code === "ENOENT") {
      /// && err.message.indexOf('ENOENT: no such file or directory') !== -1) {
      console.log('* 2. Tempdir doesn\'t exist so it needs to be created.');
      tempdirExists = false
    } else {
      return cb(`Process doesn't have permission to access ${tempdir}.`);
    }
  }

  if (!tempdirExists) {
    fs.mkdirSync(tempdir);
    console.log('* 2a. Tempdir created.');
  } else {
    console.log('* 2. Tempdir exists.');
  }

  // 3. if directory exists, check if it is git repo
  let git = simpleGit(tempdir);
  let isGitRepo = true;
  git.status(function _gitStatusHandler(err, status) {
    if (err) {
      // "fatal: Not a git repository (or any of the parent directories): .git"
      if (err.indexOf('Not a git repository') !== -1) {
        isGitRepo = false;
        console.log('* 3. Tempdir isn\'t a git repository.');
      } else {
        return cb(`Error getting repository status ${err}.`);
      }
    }

    // 4a. if it is not a git repo (or a new dir was just created), clone the repo
    if (!isGitRepo) {
      git.clone(repoPathRemote, tempdir, function _gitCloneHandler(err, status) {
        if (err) return cb(`Error cloning repository: ${err}`);
        console.log('* 4a. Finished cloning repository.');
        return cb(null, 'finished cloning repo');
      });
    } else {
      console.log('* 3. Tempdir is a git repository.');
      // 4b. if it is existing repo, check if remote is correct, if not return error
      // git remote -v
      git.getRemotes(true, function _gitRemotesHandler(err, remotesList) {
        if (err) return cb(`Error checking list of remotes: ${err}.`);
        console.log('* 4. Remotes list: ', remotesList);
        if (
          remotesList[0].name !== 'origin' ||
          !Object.keys(remotesList[0].refs).every(key => remotesList[0].refs[key] === repoPathRemote)
        ) {
          // TODO remove folder, then recreate it and clone repo
          return cb(`Existing local repository remotes aren't correct):
- should be: ${repoPathRemote}
- is: ${Object.keys(remotesList[0].refs).map(key => remotesList[0].refs[key])}
Remove ${tempdir} directory and run again.`);
        } else {
          console.log('* 4. Remotes are ok, ready to pull the latest.');
          // git fetch origin master
          // git reset —hard FETCH_HEAD
          // git clean -df

          // 6. if it was a git repo and remote was correct, pull latest...
          git.fetch('origin', 'master', (err, res) => {
            if (err) return cb(`Error when fetching: ${err}.`);
            console.log('* 6a. Fetch complete:', res);
          })
            .reset(['--hard', 'FETCH_HEAD'], (err, res) => {
              if (err) return cb(`Error when resetting: ${err}.`);
              console.log('* 6b. Reset complete:', res);
            })
            .clean('f', ['-d'], (err, res) => {
              if (err) return cb(`Error when cleaning: ${err}.`);
              console.log('* 6c. Cleaning complete:', res);
            })
            .then((v) => {
              console.log('* 6d. Finished pulling:', v);
              return cb(null, 'finished updating existing repo');
            });
        }
      });
    }
  });
}

module.exports = gitPullLocally;


// Errors:
// 1. Not a git repo:
// fatal: Not a git repository (or any of the parent directories): .git
