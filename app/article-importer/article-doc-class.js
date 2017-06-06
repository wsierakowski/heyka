class Article {
  constructor () {
    this.dirPath = null;       //  '/news/20170522-nodejs-meetup'
    this.confFile = null;      //  'conf.json'
    this.staticFiles = null;   //  ['brief.md', 'extended.md', 'imgs/diagram1.png']

    this.config = null;        //  {}
    //this.config.published = true/false;
    //this.config.content.brief = filepath;
    //this.config.content.extended = filepath;
    //this.config.content.isExtended = true/false;
    //this.config.title = 'article title';

    this.brief = null;         //  'html/md'
    this.extended = null;      //  'html/md'

    this.id = null;            //  'slug-and-id-are-the-same'
    this.slug = null;

    this.category = null;
    // {
    //   id: myUtils.slugify(articleConf.category),
    //   name: myUtils.titlefy(articleConf.category)
    // }

    this.tags = null;
    // [{
    //   _id: myUtils.slugify(tag),
    //   id: myUtils.slugify(tag),
    //   name: myUtils.camelizefy(tag)
    // }]
  }
};

module.exports = Article;
