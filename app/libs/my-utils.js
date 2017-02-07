//var _ = require('underscore');

module.exports = {
  getUrl: function() {
    var urls = Array.prototype.slice.call(arguments);
    //console.log('IN--->', urls);

    //urls = _.isString(urls) ? [urls] : urls;
    urls = typeof urls === String ? [urls] : urls;
    //urls = _.compact(urls);
    urls = urls.filter(i => !!i);

    if (urls.length === 1 && urls[0] === '/') return urls[0];


    var ret = '';
    urls.forEach(function(url) {
      if (url !== '/') ret += '/' + url;
    });
    //console.log('OUT--->', ret, '\n');
    return ret;
  }
};
