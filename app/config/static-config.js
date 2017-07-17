module.exports = {
  BLOG_TITLE: 'heyka',
  //ARTICLES_DIR_PATH: '_sample-blog-local-repo',
  STATIC_FILES_DIR_PREFIX: 'staticFiles_',
  REPO_REMOTE_PATH: 'https://github.com/wsierakowski/demo-content.git',
  REPO_REMOTE_OWNER: 'wsierakowski',
  REPO_REMOTE_NAME: 'demo-content',
  REPO_LOCAL_PATH: 'articles-repo',
  BLOG_PATHS: {
    blog: '/',
    categories: '',
    tags: 'tags'
  },
  WEBHOOK_PATH: '/gitpush',
  ARTICLES_PER_PAGE: 4,
  BLOG_PORT: 8081,
  CONTENT_SOURCE_TYPE: 'remote-github-repo'
  //CONTENT_SOURCE_TYPE: 'local-git-repo'
};
