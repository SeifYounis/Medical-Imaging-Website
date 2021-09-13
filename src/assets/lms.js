/**
 * Primary reference for IMS LTI implementation: https://github.com/hpi-schul-cloud/node-lti-provider-example
 * Another useful reference: https://community.canvaslms.com/t5/Canvas-Developers-Group/Hire-an-LTI-Consultant-Freelancer/td-p/136029
 */

const lti = require('ims-lti');
// MemoryStore shouldn't be used in production. Timestamps must be valid within a 5 minute grace period.
const nonceStore = new lti.Stores.MemoryStore();

// secrets should be stored securely in a production app
const secrets = {
  demo: 'xzc342AScx',
  demo2: 'dh43fvL-ew'
};

const getSecret = (consumerKey, callback) => {
  const secret = secrets[consumerKey];
  if (secret) {
    return callback(null, secret);
  }

  let err = new Error(`Unknown consumer ${consumerKey}`);
  err.status = 403;

  return callback(err);
};

exports.handleLaunch = (req, res, next) => {
 if (!req.body) {
    let err = new Error('Expected a body');
    err.status = 400;
    return next(err);
  }

  const consumerKey = req.body.oauth_consumer_key;
  if (!consumerKey) {
    let err = new Error('Expected a consumer');
    err.status = 422;
    return next(err);
  }

  getSecret(consumerKey, (err, consumerSecret) => {
    if (err) {
      return next(err);
    }

    const provider = new lti.Provider(consumerKey, consumerSecret, nonceStore, lti.HMAC_SHA1);

    provider.valid_request(req, req.body, (err, isValid) => {
      if (err) {
        return next(err);
      }

      if (isValid) {
        req.session.regenerate(err => {
          if (err) next(err);

          if(provider.outcome_service) {
            global.sess.provider = provider;

            return res.redirect(301, '/login');
          }
          return res.send(`It looks like this LTI tool wasn't launched as an assignment, \
          or you are trying to take it as a teacher rather than as a student.`);
        });
      } else {
        return next(err);
      }
    });
  });
};  