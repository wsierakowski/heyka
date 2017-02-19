const inflect = require('i')();

const generateURL = exports.generateURL = function generateURL () {
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
};

// borrowed from https://github.com/keystonejs/keystone-utils/blob/master/lib/index.js
const plural = exports.plural = function plural (count, sn, pl) {
  if (arguments.length === 1) {
    return inflect.pluralize(count);
  }
  if (typeof sn !== 'string') sn = '';
  if (!pl) {
    pl = inflect.pluralize(sn);
  }
  if (typeof count === 'string') {
    count = Number(count);
  } else if (typeof count !== 'number') {
    count = Object.keys(count).length;
  }
  return (count === 1 ? sn : pl).replace('*', count);
};
