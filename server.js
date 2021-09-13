// To set up server, change "start" field in package.json from "react-scripts start" to "node server.js"

// To see heroku console output, do heroku logs --tail

// Query I used to make session database table
// CREATE TABLE IF NOT EXISTS myschema.session (
//   sid varchar NOT NULL COLLATE "default",
//   sess json NOT NULL,
//   expire timestamp(6) NOT NULL,
//   CONSTRAINT "session_pkey" PRIMARY KEY ("sid")
// );
// CREATE INDEX IF NOT EXISTS "IDX_session_expire" ON myschema.session ("expire");

require('dotenv').config()

const path = require('path')
const port = process.env.PORT || 3000;

const express = require('express')
const session = require('express-session')
const app = express()

const {Pool} = require('pg')
const PostgreSQLStore = require('connect-pg-simple')(session);
const lms = require('./src/assets/lms.js')

global.sess = {};

// const pool = new Pool({
//   connectionString: process.env.DATABASE_URL,
//   ssl: {
//     rejectUnauthorized: false
//   }
// })

app.use(session({
  secret: process.env.SESSION_SECRET,
  saveUninitialized: false,
  resave: false,
}))

// app.use(session({
//   secret: process.env.SESSION_SECRET,
//   saveUninitialized: false,
//   resave: true,
//   store: new PostgreSQLStore({
//     conString: process.env.DATABASE_URL,
//     pool: pool,
//     schemaName: 'public',
//     tableName: 'session'
//   }),
//   cookie: {
//     sameSite: 'Lax',
//     maxAge: 7 * 24 * 60 * 60 * 1000, // 1 week
//     secure: false
//   }
// }))

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

  // var provider = req.session.provider;

  // if(provider.outcome_service) {
  //   provider.outcome_service.send_replace_result(parseFloat(req.body.score), (err, result) => {
  //     console.log("Graded")
  //   })
  // }
})

app.post('/launch', lms.handleLaunch);

app.post('/testing', function(req, res) {
  // Get sent data.
  // var user = req.body;

  // // Use pattern matching to scrub username input of single quotes bunched together to prevent SQL injection. Checkmake terrorists
  // var username = user.username.replace(/[\']+/, "\'\'");
  // var score = user.score;

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

app.listen(port, function(){
  console.log( `Server is listening at http://localhost:${port}`);
})