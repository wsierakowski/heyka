class DBInterface {
  construnctor() {}

  get col() {
    return {
      ARTICLES: 'articles',
      CATEGORIES: 'categories',
      TAGS: 'tags'
    };
  }

  init(cb) {
    // do all the init tasks
  }


  findOne(collection, docId, cb) {
    // collection = 'tags'

    // docId = 'programming'
  }

  find(collection, filter, queryOptions, cb) {
    // collection = 'articles'

    // filter = {
    //   category: 'tips'
    // };

    // queryProps = {
    //   skip: 0,
    //   limit: 10,
    //   direction: -1
    // }
  }

  count(collection, filter, cb) {
    // collection = 'articles'

    // filter = {
    //   category: 'tips'
    // };
  }

  create(collection, doc, cb) {
    // collection = 'articles'

    // newObj = {
    //   _id = 'uniqueId'
    // }
  }

  upsert(collection, docId, newDoc, cb) {
    // collection = 'articles'
  }
}

module.exports = DBInterface;
