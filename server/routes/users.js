const express = require('express');
const router = express.Router();

const usersController = require('../controllers/usersController')

router.get('/get-username', usersController.getUsername)

router.post('/set-username', usersController.setUsername)

module.exports = router