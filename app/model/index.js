const categories = [
  'Blog Posts',
  'Primers',
  'Tips',
  'Tutorials'
];

const articles = [{
    categories: ['Primers'],
    tags: ['programming', 'javascript'],
    publishedDate: '2013-02-01T20:43:29.258Z',
    author: {
      name: 'sigman'
    },
    hits: 2002,
    state: 'published',
    title: 'Using modules and dependency management in JavaScript applications with AMD',
    slug: 'one-here-is-a-dummy-slug',
    content: {
      isExtended: true,
      brief: 'Here is the intro to the article',
      extended: '<h4>This is the body of the article</h4>'
    },
    type: 'html',
    image: {}
  }, {
      categories: ['Tutorials'],
      tags: ['unix', 'regex'],
      publishedDate: '2014-07-05T15:21:29.258Z',
      author: {
        name: 'sigman'
      },
      hits: 1000,
      state: 'published',
      title: 'An article about regex',
      slug: 'two-here-is-a-dummy-slug',
      content: {
        isExtended: true,
        brief: 'article number two brief',
        extended: '<h4>article body</h4>'
      },
      type: 'html',
      image: {}
  }
]

module.exports = {
  categories: categories,
  articles: articles
};
