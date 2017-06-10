/** @class Interface for ContentProvider*/
class ContentProviderInterface {

  constructor(rootPath) {
    this.rootPath = rootPath;
  }

  //----------------------------------------------------------------------------
  // getPathsToFiles
  //----------------------------------------------------------------------------

  /**
   * Get a list of paths for the directories with article files.
   * @param {String} dir - The relative directory path in which the search should be performed, null for root
   * (relative to the path provided in the constructor)
   * @param {Array.<String>} fileNamesList - The list of allowed file names for confing files, null for *.
   * @param {Array.<String>} fileExtsList - The list of allowed file extenstions for confing files, null for .*.
   * @param {CP~getPathsToFilesCB} cb - The callback that handles the response.
   */
  getPathsToFiles(dir, fileNamesList, fileExtsList, cb) {
    /* Browse through all directories to identify these with the config file inside.
       Use this.rootPath as a root.
       For local file system you can use glob.
       For each directory found output the path
       ['/news/20170522-nodejs-meetup/conf.json']
    */
  }

  /**
   * @callback CP~getPathsToFilesCB
   * @param {error}
   *        An Error or null
   * @param {Array.<String>}
   *        A list of paths to config files
   */



   //----------------------------------------------------------------------------
   // readFile
   //----------------------------------------------------------------------------

   /**
    * Read file, local or remote.
    * @param {String} filePath - The relative file path
    * @param {CP~readFileCB} cb - The callback that handles the response.
    */
  readFile(filePath, cb) {
    // Use this.rootPath as a root.

    // const readStream = cp.getFile(filePath);
    // let data = '';
    // readStream.on('data', chunk => {
    //   data += chunk;
    //   }).on('end', () => {
    //     cb(null, data);
    //   }).on('error', (err) => {
    //     cb(err);
    //   });
    // }
  }

  /**
   * @callback CP~readFileCB
   * @param {error}
   *        An Error or null
   * @param {String}
   *        File contents
   */



   //----------------------------------------------------------------------------
   // copyFile
   //----------------------------------------------------------------------------

   /**
    * Read file, local or remote.
    * @param {String} sourcePath - The relative path to the source file
    * @param {String} destinationPath - The absolute path to the target file
    * @param {CP~copyFileCB} cb - The callback that handles the response.
    */
  copyFile(sourcePath, destinationPath, cb) {
    // Use this.rootPath as a root.
  }

  /**
   * @callback CP~copyFileCB
   * @param {error}
   *        An Error or null
   */
}

module.exports = ContentProviderInterface;
