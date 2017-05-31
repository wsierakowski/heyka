/** @class Interface for ContentProvider*/
class ContentProviderInterface {

  /**
   * @constructor
   * Create a ContentProvider instance.
   * @param {string} name - instance name.
   */
  constructor(name) {
    this.name = name;
  }

  /**
   * Get a list of object listing contents of the directories with article files.
   * Directory is taken into consideration when it contains conf file.
   * @param {Array.<String>} confFileNamesList - The list of allowed file names for confing files.
   * @param {Array.<String>} confFileExtsList - The list of allowed file extenstions for confing files.
   * @param {CP~getArticleDirsContentCB} cb - The callback that handles the response.
   */
  getArticleDirsContent(confFileNamesList, confFileExtsList, cb) {
    /* Browse through all directories to identify these with the config file inside.
       For each directory found output the object similar to below:
       [{
         dirPath: '/news/20170522-nodejs-meetup',
         confFile: 'conf.json',
         staticFiles: ['brief.md', 'extended.md', 'imgs/diagram1.png']
       }]
    */
  }

  /**
   * This callback is displayed as part of the Requester class.
   * @callback CP~getArticleDirsContentCB
   * @param {error}
   *        An Error or null
   * @param {ListOfArticleDirContent}
   *        A list of objects representing article directory structure
   */

   /**
    * @typedef {Array.<Object>} ListOfArticleDirContent
    * @property {string} dirPath Path to the article directory
    * @property {string} confFile The configuration file name
    * @property {Array.<string>} staticFiles The list of static files in the directory
    */

  getFileStream(filePath, cb) {
    const readStream = cp.getFile(filePath);
    let data = '';
    readStream.on('data', chunk => {
      data += chunk;
    }).on('end', () => {
      cb(null, data);
    }).on('error', (err) => {
      cb(err);
    });
  }
}

module.exports = ContentProviderInterface;
