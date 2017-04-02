const express = require('express');
const bodyParser = require('body-parser');

const conf = require('../config');

const EVENTS = {
  PUSH: 'push',
  PING: 'ping'
}
const HEADERS = {
  SIGNATURE: 'x-hub-signature',
  EVENT: 'x-github-event',
  DELIVERY: 'x-github-delivery',
};
const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET;

if (!WEBHOOK_SECRET || typeof WEBHOOK_SECRET !== 'string' || WEBHOOK_SECRET.length === 0) {
  throw new Error('WEBHOOK_SECRET env var is missing.');
}

/**
 * Starts webhook for GitHub
 * @param {function} callback Passes error as first param and event type as second
 */
function initWebhook(cb) {
  const router = express.Router();
  router.use(bodyParser.json());

  router.post(conf.WEBHOOK_PATH, function webhookRoute(req, res, next) {
    // TODO: if header origin isn't equal github then ignore straight away
    const hmac = crypto.createHmac('sha1', WEBHOOK_SECRET);

    if (
        !req.get(HEADERS.SIGNATURE) ||
        !req.get(HEADERS.EVENT) ||
        !req.get(HEADERS.DELIVERY)
    ) {
      return res.status(400).send({ error: 'Missing required headers.' });
    }

    console.log('* GitHubWebHook: event received: ', req.headers[HEADERS.EVENT]);

    // ping event is only sent on setting up a new webhook on GitHub
    if (
      req.headers[HEADERS.EVENT] !== EVENTS.PUSH &&
      req.headers[HEADERS.EVENT] !== EVENTS.PING
    ) {
      return returnError(400, `Received unexpected event: ${req.headers[HEADERS.EVENT]}.`);
    }

    hmac.update(req.body);
    let calcSignature = 'sha1=' + hmac.digest('hex');

    console.log(
      'Generated signature:', calcSignature,
      '\nReceived signature: ', req.headers[HEADERS.SIGNATURE],
      '\nMatch: ', calcSignature === req.headers[HEADERS.SIGNATURE]
    );

    if (req.get(HEADERS.SIGNATURE) !== calcSignature) {
      return res.status(400).send('Received signature doesn\'t match the calculated signature.');
    }

    getInfo(reqBodyObj);

    res.end('OK');

    // notify on successful receive of the push event
    if (req.headers[HEADERS.EVENT] === EVENTS.PUSH) {
      return cb(null, EVENTS.PUSH);
    }
  });
  return router;
}

function getInfo(body) {
  // only for push events: var hookId = body.hook_id;
  var hcTimeStamp = body.head_commit.timestamp;
  var commitsNo = body.commits.length;
  var repoName = body.repository.full_name;
  var senderLogin = body.sender.login;
  console.log('----------WebHookEventInfo----------');
  console.log('timestamp:', hcTimeStamp);
  console.log('repoName:', repoName);
  console.log('commitsNo:', commitsNo);
  console.log('senderLogin:', senderLogin);
  console.log('------------------------------------');
}

module.exports = initWebhook;
