// This file is not in use by heyka app. It is only used for experimenting.

//https://developer.github.com/v3/repos/contents/#get-contents
//https://github.com/philschatz/octokat.js/tree/master/examples
//https://developer.github.com/v3/git/trees/#get-a-tree

// const Octokat = require('octokat');
//
// const octo1 = new Octokat();
// const repo1 = octo1.repos('wsierakowski', 'demo-content');
//
// // get tree recursively
// repo1.git.trees('master?recursive=1').read((err, res) => {
//   if (err) {
//     return console.log('err:', err);
//   }
//   console.log(res);
// });
//
// // get file contents
// repo1.contents('primers/2012-03-14_regex-basics/extended.md').read((err, res) => {
//   if (err) {
//     return console.log('err:', err);
//   }
//   console.log(res);
// });

////////////////////////////////////////////////////////////////////////////////

//https://api.github.com/repos/wsierakowski/demo-content/git/trees/master?recursive=1

////////////////////////////////////////////////////////////////////////////////

// https://api.github.com/repos/wsierakowski/demo-content/git/blobs/b1cfd38665ac2fde2832f6aa643ac7b92433142b
// https://api.github.com/repos/wsierakowski/demo-content/contents/tips/2017-03-06_testing-articles-with-images/test_img2.jpeg

/*
The above returns:
{
"name": "conf.json",
"path": "tips/2017-03-06_testing-articles-with-images/conf.json",
"sha": "584b562c8b24563ebc0add638db647fb41c7af43",
"size": 361,
"url": "https://api.github.com/repos/wsierakowski/demo-content/contents/tips/2017-03-06_testing-articles-with-images/conf.json?ref=master",
"html_url": "https://github.com/wsierakowski/demo-content/blob/master/tips/2017-03-06_testing-articles-with-images/conf.json",
"git_url": "https://api.github.com/repos/wsierakowski/demo-content/git/blobs/584b562c8b24563ebc0add638db647fb41c7af43",
"download_url": "https://raw.githubusercontent.com/wsierakowski/demo-content/master/tips/2017-03-06_testing-articles-with-images/conf.json",
"type": "file",
"content": "ewogICJhdXRob3IiOiB7CiAgICAibmFtZSI6ICJzaWdtYW4iCiAgfSwKICAi Y2F0ZWdvcnkiOiAidGlwcyIsCiAgImNvbnRlbnQiOiB7CiAgICAiYnJpZWYi OiAiYnJpZWYuaHRtbCIsCiAgICAiZXh0ZW5kZWQiOiAiZXh0ZW5kZWQubWQi LAogICAgImV4dGVuZGVkVHlwZSI6ICJtZCIKICB9LAogICJwdWJsaXNoZWRE YXRlIjogIjIwMTctMDMtMDZUMDA6MDA6MDAuMDAwKzAwMDAiLAogICJwdWJs aXNoZWQiOiB0cnVlLAogICJzdGF0ZSI6ICJwdWJsaXNoZWQiLAogICJ0YWdz IjogWyJ0ZXN0aW5nIl0sCiAgInRpdGxlIjogIlRlc3RpbmcgYXJ0aWNsZSB3 aXRoIGludGVybmFsIGFzc2V0cyBzZXJ2ZWQgYXMgc3RhdGljIGZpbGVzIgp9 Cg== ",
"encoding": "base64",
"_links": {
"self": "https://api.github.com/repos/wsierakowski/demo-content/contents/tips/2017-03-06_testing-articles-with-images/conf.json?ref=master",
"git": "https://api.github.com/repos/wsierakowski/demo-content/git/blobs/584b562c8b24563ebc0add638db647fb41c7af43",
"html": "https://github.com/wsierakowski/demo-content/blob/master/tips/2017-03-06_testing-articles-with-images/conf.json"
}
}
*/

const fs = require('fs');
const https = require('https');

// function requestLogger(httpModule){
//     var original = httpModule.request
//     httpModule.request = function(options, callback){
//       console.log('**', options.href||options.proto+"://"+options.host+options.path, options.method)
//       console.log(options.url);
//       return original(options, callback)
//     }
// }
//
// requestLogger(require('http'))
// requestLogger(require('https'))

console.log('about to send the request');

const get_options = {
  host: 'api.github.com',
  port: '443',
  path: '/repos/wsierakowski/demo-content/contents/tips/2017-03-06_testing-articles-with-images/test_img2.jpeg',
  method: 'GET',
  headers: {
    'User-Agent': 'grzyb wielki',
    'Authorization': 'token ' + process.env.GITHUB_TOKEN,
    'accept': 'application/json'
  }
};

const req = https.request(get_options, function(res) {
  console.log('connected');
  let body = '';

  res.on('data', function(d) {
      body += d;
  });

  res.on('end', function() {
    // Data reception is done, do whatever with it!

    if (!body) return;

    let parsed;
    try {
      parsed = JSON.parse(body);
    } catch (e) {
      console.log('---->json error', e);
    }
    if (!parsed) return;

    const b64string = parsed.content;
    const buf = Buffer.from(b64string, 'base64');

    var wstream = fs.createWriteStream('test.jpg');
    wstream.write(buf);
    wstream.end();
    console.log('done?')
  });

  res.on('error', function(err) {
    console.log('---->0ERRoR', err);
  });
})

req.on('error', function(err) {
  console.log('---->1ERRoR', err);
});

req.end();

/////////

// var http = require('http');
// var options = {
//     host: 'www.google.com',
//     port: 80,
//     path: '/'
//   };
// var req = http.get(options, function(response) {
//   // handle the response
//   var res_data = '';
//   response.on('data', function(chunk) {
//     res_data += chunk;
//   });
//   response.on('end', function() {
//     console.log(res_data);
//   });
// });
// req.on('error', function(e) {
//   console.log("Got error: " + e.message);
// });

////////////////////////////////////////////////////////////////////////////////

//to get glob conf.json alternative:
//res.tree.map(item => item.path).filter(path => path.indexOf('conf.json') !== -1)

// to validate if a file ref in a conf matches the actual file:
//res.tree.map(item => item.path)

/*
{
    "sha": "5ab25bb36110cb9a051fb1f52cbf437fd5e59ba7",
    "url": "https://api.github.com/repos/wsierakowski/demo-content/git/trees/5ab25bb36110cb9a051fb1f52cbf437fd5e59ba7",
    "tree": [{
        "path": ".DS_Store",
        "mode": "100644",
        "type": "blob",
        "sha": "6e5e0093dfca1a7bcf617dcbf1297be7aa5fdd5b",
        "size": 6148,
        "url": "https://api.github.com/repos/wsierakowski/demo-content/git/blobs/6e5e0093dfca1a7bcf617dcbf1297be7aa5fdd5b"
    }, {
        "path": "conf-global.json",
        "mode": "100644",
        "type": "blob",
        "sha": "e69de29bb2d1d6434b8b29ae775ad8c2e48c5391",
        "size": 0,
        "url": "https://api.github.com/repos/wsierakowski/demo-content/git/blobs/e69de29bb2d1d6434b8b29ae775ad8c2e48c5391"
    }, {
        "path": "news",
        "mode": "040000",
        "type": "tree",
        "sha": "41cb144300ed187cd5e3a6b4db23fefa7c13ffbe",
        "url": "https://api.github.com/repos/wsierakowski/demo-content/git/trees/41cb144300ed187cd5e3a6b4db23fefa7c13ffbe"
    }, {
        "path": "news/.DS_Store",
        "mode": "100644",
        "type": "blob",
        "sha": "5008ddfcf53c02e82d7eee2e57c38e5672ef89f6",
        "size": 6148,
        "url": "https://api.github.com/repos/wsierakowski/demo-content/git/blobs/5008ddfcf53c02e82d7eee2e57c38e5672ef89f6"
    }, {
        "path": "primers",
        "mode": "040000",
        "type": "tree",
        "sha": "e4f41cabd0c13d39280d53cdcd5a9d2aea52dd1e",
        "url": "https://api.github.com/repos/wsierakowski/demo-content/git/trees/e4f41cabd0c13d39280d53cdcd5a9d2aea52dd1e"
    }, {
        "path": "primers/.DS_Store",
        "mode": "100644",
        "type": "blob",
        "sha": "7207c32c54dcbe753a4a6396af4474d086f67246",
        "size": 6148,
        "url": "https://api.github.com/repos/wsierakowski/demo-content/git/blobs/7207c32c54dcbe753a4a6396af4474d086f67246"
    }, {
        "path": "primers/2008-12-03_linux-basics",
        "mode": "040000",
        "type": "tree",
        "sha": "93e7e40ba1f8a4a196d3f7d41291eb09fd16fc00",
        "url": "https://api.github.com/repos/wsierakowski/demo-content/git/trees/93e7e40ba1f8a4a196d3f7d41291eb09fd16fc00"
    }, {
        "path": "primers/2008-12-03_linux-basics/brief.html",
        "mode": "100644",
        "type": "blob",
        "sha": "16c620b7ddeb237d772b2fcac3c9ece523e1df41",
        "size": 113,
        "url": "https://api.github.com/repos/wsierakowski/demo-content/git/blobs/16c620b7ddeb237d772b2fcac3c9ece523e1df41"
    }, {
        "path": "primers/2008-12-03_linux-basics/conf.json",
        "mode": "100644",
        "type": "blob",
        "sha": "d84052ef99f92ca00af2482275648a3ec500646e",
        "size": 294,
        "url": "https://api.github.com/repos/wsierakowski/demo-content/git/blobs/d84052ef99f92ca00af2482275648a3ec500646e"
    }, {
        "path": "primers/2008-12-03_linux-basics/extended.md",
        "mode": "100644",
        "type": "blob",
        "sha": "709828d9b536f6ed963b5d8d73f45c5142d9c9b7",
        "size": 21098,
        "url": "https://api.github.com/repos/wsierakowski/demo-content/git/blobs/709828d9b536f6ed963b5d8d73f45c5142d9c9b7"
    }, {
        "path": "primers/2012-02-12_box-2-d-basics-part-1",
        "mode": "040000",
        "type": "tree",
        "sha": "56882521a120a55035a30093ae0fec819fc26112",
        "url": "https://api.github.com/repos/wsierakowski/demo-content/git/trees/56882521a120a55035a30093ae0fec819fc26112"
    }, {
        "path": "primers/2012-02-12_box-2-d-basics-part-1/brief.html",
        "mode": "100644",
        "type": "blob",
        "sha": "2816e48a5089741ab1ca6457306a87e0b843f9be",
        "size": 883,
        "url": "https://api.github.com/repos/wsierakowski/demo-content/git/blobs/2816e48a5089741ab1ca6457306a87e0b843f9be"
    }, {
        "path": "primers/2012-02-12_box-2-d-basics-part-1/conf.json",
        "mode": "100644",
        "type": "blob",
        "sha": "6ace13f398486c5673beb70a1ef3e3a18e995eb8",
        "size": 338,
        "url": "https://api.github.com/repos/wsierakowski/demo-content/git/blobs/6ace13f398486c5673beb70a1ef3e3a18e995eb8"
    }, {
        "path": "primers/2012-02-12_box-2-d-basics-part-1/extended.html",
        "mode": "100644",
        "type": "blob",
        "sha": "21e927c920dc6f2b98673272fa4bf83071a58044",
        "size": 178862,
        "url": "https://api.github.com/repos/wsierakowski/demo-content/git/blobs/21e927c920dc6f2b98673272fa4bf83071a58044"
    }, {
        "path": "primers/2012-03-14_regex-basics",
        "mode": "040000",
        "type": "tree",
        "sha": "0ab17241c7f0b750c801e4683abe822f75fef444",
        "url": "https://api.github.com/repos/wsierakowski/demo-content/git/trees/0ab17241c7f0b750c801e4683abe822f75fef444"
    }, {
        "path": "primers/2012-03-14_regex-basics/brief.html",
        "mode": "100644",
        "type": "blob",
        "sha": "6f6fe3fe1d34a682ab24221fa3a0fd187f0a2d60",
        "size": 359,
        "url": "https://api.github.com/repos/wsierakowski/demo-content/git/blobs/6f6fe3fe1d34a682ab24221fa3a0fd187f0a2d60"
    }, {
        "path": "primers/2012-03-14_regex-basics/conf.json",
        "mode": "100644",
        "type": "blob",
        "sha": "300bcf0fd9d33c2ec0e8fe34e79a14078282a151",
        "size": 319,
        "url": "https://api.github.com/repos/wsierakowski/demo-content/git/blobs/300bcf0fd9d33c2ec0e8fe34e79a14078282a151"
    }, {
        "path": "primers/2012-03-14_regex-basics/extended.md",
        "mode": "100644",
        "type": "blob",
        "sha": "5b136a38af50cb3f3c46e2736e02f328a09c831d",
        "size": 19290,
        "url": "https://api.github.com/repos/wsierakowski/demo-content/git/blobs/5b136a38af50cb3f3c46e2736e02f328a09c831d"
    }, {
        "path": "primers/2013-07-23_markdown-basics",
        "mode": "040000",
        "type": "tree",
        "sha": "8f5337d76aae7a2ccca4185c81eb60d472029bd2",
        "url": "https://api.github.com/repos/wsierakowski/demo-content/git/trees/8f5337d76aae7a2ccca4185c81eb60d472029bd2"
    }, {
        "path": "primers/2013-07-23_markdown-basics/brief.html",
        "mode": "100644",
        "type": "blob",
        "sha": "6c4fd0a827ac8eace84b30f281f7ab1a69993d40",
        "size": 1160,
        "url": "https://api.github.com/repos/wsierakowski/demo-content/git/blobs/6c4fd0a827ac8eace84b30f281f7ab1a69993d40"
    }, {
        "path": "primers/2013-07-23_markdown-basics/conf.json",
        "mode": "100644",
        "type": "blob",
        "sha": "13dfc451d8a2c35deedfbf32a041c63cfeb03fc3",
        "size": 303,
        "url": "https://api.github.com/repos/wsierakowski/demo-content/git/blobs/13dfc451d8a2c35deedfbf32a041c63cfeb03fc3"
    }, {
        "path": "primers/2013-07-23_markdown-basics/extended.md",
        "mode": "100644",
        "type": "blob",
        "sha": "12163237d93edf9bdc0b92caccdef04f352c35ca",
        "size": 5673,
        "url": "https://api.github.com/repos/wsierakowski/demo-content/git/blobs/12163237d93edf9bdc0b92caccdef04f352c35ca"
    }, {
        "path": "primers/2015-09-17_couchdb-primer-part-1-the-basics",
        "mode": "040000",
        "type": "tree",
        "sha": "be9709015412e8a1d22c71d053d4a29d486cc880",
        "url": "https://api.github.com/repos/wsierakowski/demo-content/git/trees/be9709015412e8a1d22c71d053d4a29d486cc880"
    }, {
        "path": "primers/2015-09-17_couchdb-primer-part-1-the-basics/brief.html",
        "mode": "100644",
        "type": "blob",
        "sha": "e302235b9a54d2ee65db82176a220b57b552d6c6",
        "size": 267,
        "url": "https://api.github.com/repos/wsierakowski/demo-content/git/blobs/e302235b9a54d2ee65db82176a220b57b552d6c6"
    }, {
        "path": "primers/2015-09-17_couchdb-primer-part-1-the-basics/conf.json",
        "mode": "100644",
        "type": "blob",
        "sha": "f912d87c1159fc68ad87d165cfdd1b4c65de39c1",
        "size": 340,
        "url": "https://api.github.com/repos/wsierakowski/demo-content/git/blobs/f912d87c1159fc68ad87d165cfdd1b4c65de39c1"
    }, {
        "path": "primers/2015-09-17_couchdb-primer-part-1-the-basics/extended.md",
        "mode": "100644",
        "type": "blob",
        "sha": "36a6ca949e9c1bd3e850ba6132f8f3e0921a1197",
        "size": 33082,
        "url": "https://api.github.com/repos/wsierakowski/demo-content/git/blobs/36a6ca949e9c1bd3e850ba6132f8f3e0921a1197"
    }, {
        "path": "primers/2015-10-02_couchdb-primer-part-2-design-documents-and-views",
        "mode": "040000",
        "type": "tree",
        "sha": "8a47f0f5a571d4f9fdf62b58666d4bead088074d",
        "url": "https://api.github.com/repos/wsierakowski/demo-content/git/trees/8a47f0f5a571d4f9fdf62b58666d4bead088074d"
    }, {
        "path": "primers/2015-10-02_couchdb-primer-part-2-design-documents-and-views/brief.html",
        "mode": "100644",
        "type": "blob",
        "sha": "02d948588a8af371d05639960db80ccb18e2322f",
        "size": 248,
        "url": "https://api.github.com/repos/wsierakowski/demo-content/git/blobs/02d948588a8af371d05639960db80ccb18e2322f"
    }, {
        "path": "primers/2015-10-02_couchdb-primer-part-2-design-documents-and-views/conf.json",
        "mode": "100644",
        "type": "blob",
        "sha": "7f7ad4dfd321dcf832fdd3583ee754135a3d2d5c",
        "size": 356,
        "url": "https://api.github.com/repos/wsierakowski/demo-content/git/blobs/7f7ad4dfd321dcf832fdd3583ee754135a3d2d5c"
    }, {
        "path": "primers/2015-10-02_couchdb-primer-part-2-design-documents-and-views/extended.md",
        "mode": "100644",
        "type": "blob",
        "sha": "57c9937ad3eb39334f4a26711bb7f7e9d7302b4a",
        "size": 39993,
        "url": "https://api.github.com/repos/wsierakowski/demo-content/git/blobs/57c9937ad3eb39334f4a26711bb7f7e9d7302b4a"
    }, {
        "path": "tips",
        "mode": "040000",
        "type": "tree",
        "sha": "fc39ef88729a3e8af45305006c4e19960e18ae32",
        "url": "https://api.github.com/repos/wsierakowski/demo-content/git/trees/fc39ef88729a3e8af45305006c4e19960e18ae32"
    }, {
        "path": "tips/.DS_Store",
        "mode": "100644",
        "type": "blob",
        "sha": "98d4e1e17c90c6fce9e7ca0602c9382f5f68d83e",
        "size": 6148,
        "url": "https://api.github.com/repos/wsierakowski/demo-content/git/blobs/98d4e1e17c90c6fce9e7ca0602c9382f5f68d83e"
    }, {
        "path": "tips/2011-05-22_building-mobile-games-in-adobe-air-techniques-used-in-jumping-droid",
        "mode": "040000",
        "type": "tree",
        "sha": "ae2e28dd143143beb37804965d9ce99740d3b51e",
        "url": "https://api.github.com/repos/wsierakowski/demo-content/git/trees/ae2e28dd143143beb37804965d9ce99740d3b51e"
    }, {
        "path": "tips/2011-05-22_building-mobile-games-in-adobe-air-techniques-used-in-jumping-droid/brief.html",
        "mode": "100644",
        "type": "blob",
        "sha": "7fa718eda2038beb4baac23838a4ae215e25355a",
        "size": 621,
        "url": "https://api.github.com/repos/wsierakowski/demo-content/git/blobs/7fa718eda2038beb4baac23838a4ae215e25355a"
    }, {
        "path": "tips/2011-05-22_building-mobile-games-in-adobe-air-techniques-used-in-jumping-droid/conf.json",
        "mode": "100644",
        "type": "blob",
        "sha": "6e115443056b3728cb991ed3f81029ee2b5fe421",
        "size": 370,
        "url": "https://api.github.com/repos/wsierakowski/demo-content/git/blobs/6e115443056b3728cb991ed3f81029ee2b5fe421"
    }, {
        "path": "tips/2011-05-22_building-mobile-games-in-adobe-air-techniques-used-in-jumping-droid/extended.html",
        "mode": "100644",
        "type": "blob",
        "sha": "c9730387cb382eeca4fc604addaffd7052d9323a",
        "size": 152427,
        "url": "https://api.github.com/repos/wsierakowski/demo-content/git/blobs/c9730387cb382eeca4fc604addaffd7052d9323a"
    }, {
        "path": "tips/2011-11-15_getting-certificates-and-provisioning-profiles-for-ios-on-windows",
        "mode": "040000",
        "type": "tree",
        "sha": "044e820adf5245b4b24747167cc8728f1335311b",
        "url": "https://api.github.com/repos/wsierakowski/demo-content/git/trees/044e820adf5245b4b24747167cc8728f1335311b"
    }, {
        "path": "tips/2011-11-15_getting-certificates-and-provisioning-profiles-for-ios-on-windows/brief.html",
        "mode": "100644",
        "type": "blob",
        "sha": "73fddac21f233cb99ad25dc3b0e9f6667a9bddef",
        "size": 279,
        "url": "https://api.github.com/repos/wsierakowski/demo-content/git/blobs/73fddac21f233cb99ad25dc3b0e9f6667a9bddef"
    }, {
        "path": "tips/2011-11-15_getting-certificates-and-provisioning-profiles-for-ios-on-windows/conf.json",
        "mode": "100644",
        "type": "blob",
        "sha": "b26c4557e06c23bf2384669bedd9df155cd0b19f",
        "size": 366,
        "url": "https://api.github.com/repos/wsierakowski/demo-content/git/blobs/b26c4557e06c23bf2384669bedd9df155cd0b19f"
    }, {
        "path": "tips/2011-11-15_getting-certificates-and-provisioning-profiles-for-ios-on-windows/extended.html",
        "mode": "100644",
        "type": "blob",
        "sha": "fe3ff67e4bb5a2c83afaa4785da3514050f681f4",
        "size": 7575,
        "url": "https://api.github.com/repos/wsierakowski/demo-content/git/blobs/fe3ff67e4bb5a2c83afaa4785da3514050f681f4"
    }, {
        "path": "tips/2011-12-01_building-ios-app-with-adobe-air-things-learnt-when-developing-colorbyshape-app",
        "mode": "040000",
        "type": "tree",
        "sha": "d25d72e3ffe9b74d081adce4916bf74376a7909d",
        "url": "https://api.github.com/repos/wsierakowski/demo-content/git/trees/d25d72e3ffe9b74d081adce4916bf74376a7909d"
    }, {
        "path": "tips/2011-12-01_building-ios-app-with-adobe-air-things-learnt-when-developing-colorbyshape-app/brief.html",
        "mode": "100644",
        "type": "blob",
        "sha": "aaa9dfcf883b896e44c5a7a1ff6928a8c5b137cc",
        "size": 388,
        "url": "https://api.github.com/repos/wsierakowski/demo-content/git/blobs/aaa9dfcf883b896e44c5a7a1ff6928a8c5b137cc"
    }, {
        "path": "tips/2011-12-01_building-ios-app-with-adobe-air-things-learnt-when-developing-colorbyshape-app/conf.json",
        "mode": "100644",
        "type": "blob",
        "sha": "af1ac9a54ede604b2af987733c914abb1145e1a9",
        "size": 381,
        "url": "https://api.github.com/repos/wsierakowski/demo-content/git/blobs/af1ac9a54ede604b2af987733c914abb1145e1a9"
    }, {
        "path": "tips/2011-12-01_building-ios-app-with-adobe-air-things-learnt-when-developing-colorbyshape-app/extended.html",
        "mode": "100644",
        "type": "blob",
        "sha": "44d7c4e5d42fef7337d4c0041f0275130b387e4a",
        "size": 19867,
        "url": "https://api.github.com/repos/wsierakowski/demo-content/git/blobs/44d7c4e5d42fef7337d4c0041f0275130b387e4a"
    }, {
        "path": "tips/2012-01-19_saving-and-loading-complex-objects-from-a-file-with-flashplayer",
        "mode": "040000",
        "type": "tree",
        "sha": "e6dd8b3deb05d6567a426142d2fdfdea4cc21dbc",
        "url": "https://api.github.com/repos/wsierakowski/demo-content/git/trees/e6dd8b3deb05d6567a426142d2fdfdea4cc21dbc"
    }, {
        "path": "tips/2012-01-19_saving-and-loading-complex-objects-from-a-file-with-flashplayer/brief.html",
        "mode": "100644",
        "type": "blob",
        "sha": "3952e6df055507ec2a90c0d4066832935d294562",
        "size": 926,
        "url": "https://api.github.com/repos/wsierakowski/demo-content/git/blobs/3952e6df055507ec2a90c0d4066832935d294562"
    }, {
        "path": "tips/2012-01-19_saving-and-loading-complex-objects-from-a-file-with-flashplayer/conf.json",
        "mode": "100644",
        "type": "blob",
        "sha": "5a9efd7dcbb753acc06e6b343858ad93b0a94abd",
        "size": 368,
        "url": "https://api.github.com/repos/wsierakowski/demo-content/git/blobs/5a9efd7dcbb753acc06e6b343858ad93b0a94abd"
    }, {
        "path": "tips/2012-01-19_saving-and-loading-complex-objects-from-a-file-with-flashplayer/extended.html",
        "mode": "100644",
        "type": "blob",
        "sha": "00e71611f828153ccd0b56f78a2bb18b7458ad0c",
        "size": 45737,
        "url": "https://api.github.com/repos/wsierakowski/demo-content/git/blobs/00e71611f828153ccd0b56f78a2bb18b7458ad0c"
    }, {
        "path": "tips/2016-03-15_creating-command-line-tools-with-nodejs",
        "mode": "040000",
        "type": "tree",
        "sha": "b3cb70edf8c2e7d4b803e448fe0936a81156133e",
        "url": "https://api.github.com/repos/wsierakowski/demo-content/git/trees/b3cb70edf8c2e7d4b803e448fe0936a81156133e"
    }, {
        "path": "tips/2016-03-15_creating-command-line-tools-with-nodejs/brief.html",
        "mode": "100644",
        "type": "blob",
        "sha": "66cc20335bc14bb3784edb931454f2eb6a00c51b",
        "size": 408,
        "url": "https://api.github.com/repos/wsierakowski/demo-content/git/blobs/66cc20335bc14bb3784edb931454f2eb6a00c51b"
    }, {
        "path": "tips/2016-03-15_creating-command-line-tools-with-nodejs/conf.json",
        "mode": "100644",
        "type": "blob",
        "sha": "5e4e552e77eba6215d5cb3ec1799030811d50413",
        "size": 360,
        "url": "https://api.github.com/repos/wsierakowski/demo-content/git/blobs/5e4e552e77eba6215d5cb3ec1799030811d50413"
    }, {
        "path": "tips/2016-03-15_creating-command-line-tools-with-nodejs/extended.md",
        "mode": "100644",
        "type": "blob",
        "sha": "ccd4abf33372389ffe51da5a8dc6a2328209955a",
        "size": 12566,
        "url": "https://api.github.com/repos/wsierakowski/demo-content/git/blobs/ccd4abf33372389ffe51da5a8dc6a2328209955a"
    }, {
        "path": "tips/2017-03-06_testing-articles-with-images",
        "mode": "040000",
        "type": "tree",
        "sha": "3233bc1a2d5f42e4b41028c9efccbca31ad90de7",
        "url": "https://api.github.com/repos/wsierakowski/demo-content/git/trees/3233bc1a2d5f42e4b41028c9efccbca31ad90de7"
    }, {
        "path": "tips/2017-03-06_testing-articles-with-images/.DS_Store",
        "mode": "100644",
        "type": "blob",
        "sha": "796d73df88c1ce694a8ec104dc0e760da87639b8",
        "size": 6148,
        "url": "https://api.github.com/repos/wsierakowski/demo-content/git/blobs/796d73df88c1ce694a8ec104dc0e760da87639b8"
    }, {
        "path": "tips/2017-03-06_testing-articles-with-images/assets",
        "mode": "040000",
        "type": "tree",
        "sha": "8cd0fce03b0abb38a869c9e4105879e623653cd3",
        "url": "https://api.github.com/repos/wsierakowski/demo-content/git/trees/8cd0fce03b0abb38a869c9e4105879e623653cd3"
    }, {
        "path": "tips/2017-03-06_testing-articles-with-images/assets/large_img1.jpg",
        "mode": "100644",
        "type": "blob",
        "sha": "be616aa5da2158b97cb223fa55f6a5b44d21d08a",
        "size": 43713,
        "url": "https://api.github.com/repos/wsierakowski/demo-content/git/blobs/be616aa5da2158b97cb223fa55f6a5b44d21d08a"
    }, {
        "path": "tips/2017-03-06_testing-articles-with-images/assets/large_img2.jpg",
        "mode": "100644",
        "type": "blob",
        "sha": "b9a9df9a2694af025192b92b16908c78138d5696",
        "size": 38678,
        "url": "https://api.github.com/repos/wsierakowski/demo-content/git/blobs/b9a9df9a2694af025192b92b16908c78138d5696"
    }, {
        "path": "tips/2017-03-06_testing-articles-with-images/assets/readme.txt",
        "mode": "100644",
        "type": "blob",
        "sha": "203ef3e6656bb84f713f802379b0d023509811b7",
        "size": 29,
        "url": "https://api.github.com/repos/wsierakowski/demo-content/git/blobs/203ef3e6656bb84f713f802379b0d023509811b7"
    }, {
        "path": "tips/2017-03-06_testing-articles-with-images/brief.html",
        "mode": "100644",
        "type": "blob",
        "sha": "b213ecdb66dadb255d38bf73d2c7c1828c61135b",
        "size": 453,
        "url": "https://api.github.com/repos/wsierakowski/demo-content/git/blobs/b213ecdb66dadb255d38bf73d2c7c1828c61135b"
    }, {
        "path": "tips/2017-03-06_testing-articles-with-images/conf.json",
        "mode": "100644",
        "type": "blob",
        "sha": "584b562c8b24563ebc0add638db647fb41c7af43",
        "size": 361,
        "url": "https://api.github.com/repos/wsierakowski/demo-content/git/blobs/584b562c8b24563ebc0add638db647fb41c7af43"
    }, {
        "path": "tips/2017-03-06_testing-articles-with-images/extended.md",
        "mode": "100644",
        "type": "blob",
        "sha": "107faffd3d39b364c122cbb3ad875415c82565f5",
        "size": 1007,
        "url": "https://api.github.com/repos/wsierakowski/demo-content/git/blobs/107faffd3d39b364c122cbb3ad875415c82565f5"
    }, {
        "path": "tips/2017-03-06_testing-articles-with-images/index.html",
        "mode": "100644",
        "type": "blob",
        "sha": "8a998d094a042ca5f3a4265b38652e0113ff5c9e",
        "size": 9,
        "url": "https://api.github.com/repos/wsierakowski/demo-content/git/blobs/8a998d094a042ca5f3a4265b38652e0113ff5c9e"
    }, {
        "path": "tips/2017-03-06_testing-articles-with-images/test_img1.jpeg",
        "mode": "100644",
        "type": "blob",
        "sha": "b1cfd38665ac2fde2832f6aa643ac7b92433142b",
        "size": 5014,
        "url": "https://api.github.com/repos/wsierakowski/demo-content/git/blobs/b1cfd38665ac2fde2832f6aa643ac7b92433142b"
    }, {
        "path": "tips/2017-03-06_testing-articles-with-images/test_img2.jpeg",
        "mode": "100644",
        "type": "blob",
        "sha": "fcd305177a700e5ef350dccc110eda4d0ad113ca",
        "size": 4343,
        "url": "https://api.github.com/repos/wsierakowski/demo-content/git/blobs/fcd305177a700e5ef350dccc110eda4d0ad113ca"
    }, {
        "path": "tips/2017-03-06_testing-articles-with-images/test_img3.jpeg",
        "mode": "100644",
        "type": "blob",
        "sha": "e7ce956519f7f615134d22a793b02dffa1d8cafb",
        "size": 4208,
        "url": "https://api.github.com/repos/wsierakowski/demo-content/git/blobs/e7ce956519f7f615134d22a793b02dffa1d8cafb"
    }, {
        "path": "tutorials",
        "mode": "040000",
        "type": "tree",
        "sha": "f078062248708ebb40619aacd4ce95c58eaf674e",
        "url": "https://api.github.com/repos/wsierakowski/demo-content/git/trees/f078062248708ebb40619aacd4ce95c58eaf674e"
    }, {
        "path": "tutorials/.DS_Store",
        "mode": "100644",
        "type": "blob",
        "sha": "5008ddfcf53c02e82d7eee2e57c38e5672ef89f6",
        "size": 6148,
        "url": "https://api.github.com/repos/wsierakowski/demo-content/git/blobs/5008ddfcf53c02e82d7eee2e57c38e5672ef89f6"
    }, {
        "path": "tutorials/2011-05-10_starting-with-air-for-android-and-ios-building-one-app-for-both-platforms",
        "mode": "040000",
        "type": "tree",
        "sha": "8d580530339383164581640ab3d7b21ada83dfee",
        "url": "https://api.github.com/repos/wsierakowski/demo-content/git/trees/8d580530339383164581640ab3d7b21ada83dfee"
    }, {
        "path": "tutorials/2011-05-10_starting-with-air-for-android-and-ios-building-one-app-for-both-platforms/brief.html",
        "mode": "100644",
        "type": "blob",
        "sha": "568735fbbbfe71d41d08c50e362e026f1ac48199",
        "size": 659,
        "url": "https://api.github.com/repos/wsierakowski/demo-content/git/blobs/568735fbbbfe71d41d08c50e362e026f1ac48199"
    }, {
        "path": "tutorials/2011-05-10_starting-with-air-for-android-and-ios-building-one-app-for-both-platforms/conf.json",
        "mode": "100644",
        "type": "blob",
        "sha": "c17d0eb8691a7bd454394d8e466f69385ecf68c2",
        "size": 390,
        "url": "https://api.github.com/repos/wsierakowski/demo-content/git/blobs/c17d0eb8691a7bd454394d8e466f69385ecf68c2"
    }, {
        "path": "tutorials/2011-05-10_starting-with-air-for-android-and-ios-building-one-app-for-both-platforms/extended.html",
        "mode": "100644",
        "type": "blob",
        "sha": "03cad726453e4e0eadaed22bc1c66f185cfb2736",
        "size": 123618,
        "url": "https://api.github.com/repos/wsierakowski/demo-content/git/blobs/03cad726453e4e0eadaed22bc1c66f185cfb2736"
    }, {
        "path": "tutorials/2011-08-06_simple-pathfinding-algorithm-in-actionscript-3",
        "mode": "040000",
        "type": "tree",
        "sha": "30b73b5b12020c6048b1a8012e3f055fc3c8cb5e",
        "url": "https://api.github.com/repos/wsierakowski/demo-content/git/trees/30b73b5b12020c6048b1a8012e3f055fc3c8cb5e"
    }, {
        "path": "tutorials/2011-08-06_simple-pathfinding-algorithm-in-actionscript-3/brief.html",
        "mode": "100644",
        "type": "blob",
        "sha": "ec1a5c19a363b0148a1a315b2954f1f9b41c144e",
        "size": 467,
        "url": "https://api.github.com/repos/wsierakowski/demo-content/git/blobs/ec1a5c19a363b0148a1a315b2954f1f9b41c144e"
    }, {
        "path": "tutorials/2011-08-06_simple-pathfinding-algorithm-in-actionscript-3/conf.json",
        "mode": "100644",
        "type": "blob",
        "sha": "8478d51819c373532ac013c048cb9fe7ba437f25",
        "size": 357,
        "url": "https://api.github.com/repos/wsierakowski/demo-content/git/blobs/8478d51819c373532ac013c048cb9fe7ba437f25"
    }, {
        "path": "tutorials/2011-08-06_simple-pathfinding-algorithm-in-actionscript-3/extended.html",
        "mode": "100644",
        "type": "blob",
        "sha": "a28fccd31e395ac3422966029c51a28451d8f01b",
        "size": 66573,
        "url": "https://api.github.com/repos/wsierakowski/demo-content/git/blobs/a28fccd31e395ac3422966029c51a28451d8f01b"
    }, {
        "path": "tutorials/2012-09-05_agal-multitexture-shader",
        "mode": "040000",
        "type": "tree",
        "sha": "d20548dc9d910f297f247359fd3f157880759f4b",
        "url": "https://api.github.com/repos/wsierakowski/demo-content/git/trees/d20548dc9d910f297f247359fd3f157880759f4b"
    }, {
        "path": "tutorials/2012-09-05_agal-multitexture-shader/brief.html",
        "mode": "100644",
        "type": "blob",
        "sha": "61b7e33e30e3831b4f1382f32045efbe4654b81d",
        "size": 518,
        "url": "https://api.github.com/repos/wsierakowski/demo-content/git/blobs/61b7e33e30e3831b4f1382f32045efbe4654b81d"
    }, {
        "path": "tutorials/2012-09-05_agal-multitexture-shader/conf.json",
        "mode": "100644",
        "type": "blob",
        "sha": "f7e0a2c8031082f759194824427509d2ddcfc602",
        "size": 334,
        "url": "https://api.github.com/repos/wsierakowski/demo-content/git/blobs/f7e0a2c8031082f759194824427509d2ddcfc602"
    }, {
        "path": "tutorials/2012-09-05_agal-multitexture-shader/extended.html",
        "mode": "100644",
        "type": "blob",
        "sha": "11cbd0521ad0c6ad47b3774044ff17de8c56efa6",
        "size": 21186,
        "url": "https://api.github.com/repos/wsierakowski/demo-content/git/blobs/11cbd0521ad0c6ad47b3774044ff17de8c56efa6"
    }, {
        "path": "tutorials/2013-06-02_using-modules-and-dependency-management-in-javascript-applications-with-amd-require-js",
        "mode": "040000",
        "type": "tree",
        "sha": "4f90119675a66009bbedf20559532d6da9005913",
        "url": "https://api.github.com/repos/wsierakowski/demo-content/git/trees/4f90119675a66009bbedf20559532d6da9005913"
    }, {
        "path": "tutorials/2013-06-02_using-modules-and-dependency-management-in-javascript-applications-with-amd-require-js/brief.html",
        "mode": "100644",
        "type": "blob",
        "sha": "7ed1f21291d31545316f13ef080340bdfcbda7f7",
        "size": 2146,
        "url": "https://api.github.com/repos/wsierakowski/demo-content/git/blobs/7ed1f21291d31545316f13ef080340bdfcbda7f7"
    }, {
        "path": "tutorials/2013-06-02_using-modules-and-dependency-management-in-javascript-applications-with-amd-require-js/conf.json",
        "mode": "100644",
        "type": "blob",
        "sha": "b45b2f83416c1a73c82df4a615653304baf057f3",
        "size": 396,
        "url": "https://api.github.com/repos/wsierakowski/demo-content/git/blobs/b45b2f83416c1a73c82df4a615653304baf057f3"
    }, {
        "path": "tutorials/2013-06-02_using-modules-and-dependency-management-in-javascript-applications-with-amd-require-js/extended.html",
        "mode": "100644",
        "type": "blob",
        "sha": "7bc0f91f56ebb6e521ef61700f634f29473c1d90",
        "size": 85568,
        "url": "https://api.github.com/repos/wsierakowski/demo-content/git/blobs/7bc0f91f56ebb6e521ef61700f634f29473c1d90"
    }, {
        "path": "tutorials/only-one-with-yaml",
        "mode": "040000",
        "type": "tree",
        "sha": "f6a0ec50f168d160688c4f4407f6a137cf647b61",
        "url": "https://api.github.com/repos/wsierakowski/demo-content/git/trees/f6a0ec50f168d160688c4f4407f6a137cf647b61"
    }, {
        "path": "tutorials/only-one-with-yaml/conf.yaml1",
        "mode": "100644",
        "type": "blob",
        "sha": "e69de29bb2d1d6434b8b29ae775ad8c2e48c5391",
        "size": 0,
        "url": "https://api.github.com/repos/wsierakowski/demo-content/git/blobs/e69de29bb2d1d6434b8b29ae775ad8c2e48c5391"
    }],
    "truncated": false
}
*/
