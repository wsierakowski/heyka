const fs = require('fs-extra');

const makeDirSync = exports.makeDirSync = function makeDirSync(dirPath) {
  try {
    fs.accessSync(dirPath, fs.constants.R_OK | fs.constants.W_OK);
  } catch (err) {
    if (err.code === "ENOENT") {
      /// && err.message.indexOf('ENOENT: no such file or directory') !== -1) {
      console.log(`Path ${dirPath} doesn\'t exist so it needs to be created.`);
      fs.mkdirSync(dirPath);
    } else {
      return cb(`Process doesn't have permission to access ${dirPath}.`);
    }
  }
}

const copyFile = exports.copyFile = function copyFile(source, target, cb) {
  var cbCalled = false;

  var rd = fs.createReadStream(source);
  rd.on("error", function(err) {
    done(err);
  });
  var wr = fs.createWriteStream(target);
  wr.on("error", function(err) {
    done(err);
  });
  wr.on("close", function(ex) {
    done();
  });
  rd.pipe(wr);

  function done(err) {
    if (!cbCalled) {
      cb(err);
      cbCalled = true;
    }
  }
}
