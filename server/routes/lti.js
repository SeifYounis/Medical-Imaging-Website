const express = require('express')
const router = express.Router()

const lti_controller = require('../controllers/lti_controller')

// Route for processing launch of app through Canvas assignment
router.post('/launch', lti_controller.handleLaunch);

// Route for posting grade to Canvas student's profile
router.post('/post-grade', lti_controller.postGrade)

module.exports = router