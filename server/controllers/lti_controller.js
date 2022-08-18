/**
 * Primary reference for IMS LTI implementation: https://github.com/js-kyle/nodejs-lti-provider
 * Other important references: 
 * https://community.canvaslms.com/t5/Canvas-Developers-Group/Hire-an-LTI-Consultant-Freelancer/td-p/136029
 * https://community.canvaslms.com/t5/Canvas-Developers-Group/SameSite-Cookies-and-Canvas/ba-p/257967
 * https://github.com/instructure/ims-lti
 * 
 */

/**
 * Assessments are accessed via Canvas assignments. These assignments
 * have a launch URL that must be redirected to the appropriate assessment URL.
 * This code acts as middleware for that launch route. The request sent to 
 * the launch URL contains important information about the assigment and the
 * student accessing it. With this info, we can configure the assessment
 * to be opened, track students, and post grades.
 */
const lti = require('ims-lti');

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
        // res.cookie("canvas_lti_launch_params", provider.body, {
        //   maxAge: 1000 * 60 * 60 * 6, // Cookie lasts 6 hours, after which time the assignment must be relaunched
        //   secure: false,
        //   httpOnly: true,
        //   sameSite: 'none', // This property is absolutely necessary to ensure launch URL can save these params in a cookie
        // });

        // Check if app was launched by an instructor
        if (provider.body.roles[0] === 'Instructor') {
          return res.redirect('/admin')
        }

        // Check if app was launched as an assignment by a student
        if (provider.outcome_service) {

          // Save Canvas launch parameters to session so grades can be set later, as
          // well as student ID
          req.session.canvas_lti_launch_params = provider.body;
          req.session.student_id = provider.body.user_id

          // Determine appropriate assessment to launch by matching assessment name to assignment title
          let route = "";

          if (provider.body.custom_canvas_assignment_title.includes("Reader Study Login")) {
            route += '/login'
          }

          if (provider.body.custom_canvas_assignment_title.includes("Testing Part 1")) {
            route += '/testing1';
          }

          if (provider.body.custom_canvas_assignment_title.includes("Testing Part 2")) {
            route += '/testing2';
          }

          if (provider.body.custom_canvas_assignment_title.includes("Training")) {
            route += '/training';
          }

          if (provider.body.custom_canvas_assignment_title.includes("Rating")) {
            route += '/rating';
          }

          if (provider.body.custom_canvas_assignment_title.includes("Two Alternative Forced Choice")) {
            route += '/alternative-choice';
          }

          // If name of course user is taking includes the words "Self Study", load self-study version of these assessments
          if (provider.body.context_title.includes('Self Study') && !route.includes('login')) {
            route += '-solo'
          }
          
          return res.redirect(route)
        }

        return res.send(`It looks like this LTI wasn't launched as an assignment`);

      } else {
        return next(err);
      }
    });
  });
};

// Post grade to student's gradebook
exports.postGrade = (req, res, next) => {
  const provider = new lti.Provider(process.env.CONSUMER_KEY, process.env.CONSUMER_SECRET, nonceStore, lti.HMAC_SHA1);

  provider.valid_request(req, req.session.canvas_lti_launch_params, (_err, _isValid) => {
    let score = parseFloat(req.body.score);

    provider.outcome_service.send_replace_result(score, (_err, _result) => {
      console.log("Graded")
      return res.status(200).send("Grade successfully posted")
    })
  });
}