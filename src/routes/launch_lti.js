/**
 * Primary reference for IMS LTI implementation: https://github.com/js-kyle/nodejs-lti-provider
 * Other important references: 
 * https://community.canvaslms.com/t5/Canvas-Developers-Group/Hire-an-LTI-Consultant-Freelancer/td-p/136029
 * https://community.canvaslms.com/t5/Canvas-Developers-Group/SameSite-Cookies-and-Canvas/ba-p/257967
 * https://github.com/instructure/ims-lti
 * https://github.com/hpi-schul-cloud/node-lti-provider-example
 * 
 */

const lti = require('ims-lti');

// MemoryStore shouldn't be used in production. Timestamps must be valid within a 5 minute grace period.
const nonceStore = new lti.Stores.MemoryStore();

// If app is configured with correct consumer key, proceed to process launch parameters
const getSecret = (consumerKey, callback) => {
  const actualKey = process.env.CONSUMER_KEY;

  if (consumerKey === actualKey) {
    return callback(null, process.env.CONSUMER_SECRET);
  }

  let err = new Error(`Unknown consumer ${consumerKey}`);
  err.status = 403;

  return callback(err);
};

/**
 *  Check that app was configured correctly, process launch parameters and display page corresponding with certain info in request params
 */ 
exports.handleLaunch = (req, res, next) => {
  if (!req.body) {
    let err = new Error('Expected a body');
    err.status = 400;
    return next(err);
  }

  // Ensure request body contains oauth consumer key obtained from launch URL
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

    // Create new Provider object enabling us to process request params from launch URL
    const provider = new lti.Provider(consumerKey, consumerSecret, nonceStore, lti.HMAC_SHA1);

    provider.valid_request(req, req.body, (err, isValid) => {
      if (err) {
        return next(err);
      }

      if (isValid) {
        /**
         * Use cookies to save special request parameters sent by the launch URL. 
         * The information from these parameters can enable grade passback
         */
        // res.cookie("canvas_lti_launch_params", provider.body, {
        //   maxAge: 1000 * 60 * 60 * 6, // Cookie lasts 6 hours, after which time the assignment must be relaunched
        //   secure: false,
        //   httpOnly: true,
        //   sameSite: 'none', // This property is absolutely necessary to ensure launch URL can save these params in a cookie
        // });

        req.session.regenerate(err => {
          if (err) next(err);

          req.session.canvas_lti_launch_params = provider.body;
          req.session.student_id = provider.body.user_id

          // Check if app was launched as an assignment by a student
          if (provider.outcome_service) {
            if(provider.body.custom_canvas_assignment_title === "Reader Study Login") {
              return res.redirect('/login')
            }

            if(provider.body.custom_canvas_assignment_title === "Testing") {
              return res.redirect('/testing');
            }

            if(provider.body.custom_canvas_assignment_title === "Training") {
              return res.redirect('/training');
            }

            if(provider.body.custom_canvas_assignment_title === "Rating") {
              return res.redirect('/rating');
            }

            if(provider.body.custom_canvas_assignment_title === "Two Alternate Forced Choice") {
              return res.redirect('/alternate-choice');
            }
          }

          // Check if app was launched by an instructor
          if (provider.body.roles[0] === 'Instructor') {
            return res.redirect('/admin')
          }

          return res.send(`It looks like this LTI wasn't launched as an assignment`);

        });
        
      } else {
        return next(err);
      }
    });
  });
};