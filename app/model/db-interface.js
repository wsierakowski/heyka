class DBInterface {
  construnctor() {}

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
    // collection = "articles"

    // filter = {
    //   category: 'tips'
    // };
  }

  create(collection, newObj, cb) {
    // collection = "articles"

    // newObj = {
    //   _id = 'uniqueId'
    // }
  }
}
