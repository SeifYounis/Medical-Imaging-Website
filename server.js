// To set up server, change "start" field in package.json from "react-scripts start" to "node server.js"

// To see heroku console output, do heroku logs --tail

const express = require('express')
const session = require('express-session')
const path = require('path')
const port = process.env.PORT || 3000;
const app = express()
const {Client} = require('pg')
const lms = require('./src/assets/lms.js')
require('dotenv').config()

global.sess = {};

app.use(session({
  secret: process.env.SESSION_SECRET || 'dev',
  resave: false,
  saveUninitialized: true,
}));

// Used to parse request data that sent from web pages in JSON format
app.use(express.json())
app.use(express.urlencoded({extended: false}))

// the __dirname is the current directory from where the script is running
app.use(express.static(path.join(__dirname, 'static')));
app.get('/', function(req, res) {
  res.sendFile(path.join(__dirname, 'static', 'main.html'))  
})

app.use(express.static(path.join(__dirname, 'build')));
app.get(/[a-z]+/, function (req, res) {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

app.post('/application', function(req, res) {
  var provider = global.sess.provider;

  if(provider.outcome_service) {
    provider.outcome_service.send_replace_result(parseFloat(req.body.score), (err, result) => {
      console.log("Graded")
    })
  }
})

app.post('/testing', function(req, res) {
  // Get sent data.
  // var user = req.body;

  // // Use pattern matching to scrub username input of single quotes bunched together to prevent SQL injection. Checkmake terrorists
  // var username = user.username.replace(/[\']+/, "\'\'");
  // var score = user.score;

  // console.log([username, score]);

  // // Create connection
  // const client = new Client({
  //   connectionString: process.env.DATABASE_URL,
  //   ssl: {
  //     rejectUnauthorized: false,
  //   },
  // });

  // client.connect((err) => {
  //   if(err) throw err;
  //   console.log('PostgreSQL Connected');
  // })

  // // Do a PostgreSQL query
  // client.query(`INSERT INTO students(username, score) VALUES (\'${username}\', ${score})`, function(err, result) {
  //   if (err) throw err;

  //   client.end(function(err, result) {
  //     if (err) throw err;

  //     console.log("Connection to database ended")
  //   });
  // });

  // client.query(`SELECT * FROM students`, function (err, result) {
  //   if (err) throw err;
  // })

  res.end('Success');
});

app.post('/launch', lms.handleLaunch);

app.listen(port, function(){
  console.log( `Server is listening at http://localhost:${port}`);
})