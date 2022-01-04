const express = require('express');
const router = express.Router();
const pool = require('../util/db')

router.get('/get-username', (req, res) => {
  let username;

  // Do a PostgreSQL query
  pool.query("SELECT username FROM students WHERE student_id=$1", [
    req.session.student_id
  ], (err, result) => {
    if (err) throw err;

    username = result.rows[0]
    
    if(!username) {
      res.status(200).json({username: null})
    } else {
      res.status(200).json(username);
    }
  })
})

router.post('/set-username', (req, res) => {
  // Get sent data.
  let username = req.body.username;

  // Do a PostgreSQL query
  pool.query("INSERT INTO students(student_id, username) VALUES ($1, $2)", [
      req.session.student_id,
      username
  ], (err, result) => {
      if (err) throw err;
  })
})

module.exports = router