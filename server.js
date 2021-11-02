// To see heroku console output, do heroku logs --tail

// Query I used to make session database table
// CREATE TABLE IF NOT EXISTS myschema.session (
//   sid varchar NOT NULL COLLATE "default",
//   sess json NOT NULL,
//   expire timestamp(6) NOT NULL,
//   CONSTRAINT "session_pkey" PRIMARY KEY ("sid")
// );
// CREATE INDEX IF NOT EXISTS "IDX_session_expire" ON myschema.session ("expire");

// Query obtained here: https://medium.com/developer-rants/how-to-handle-sessions-properly-in-express-js-with-heroku-c35ea8c0e500

require('dotenv').config()

const path = require('path')
const port = process.env.PORT || 3000;

const express = require('express')
const session = require('express-session');
// const cookieParser = require('cookie-parser');
const app = express()

const {Pool} = require('pg')
const PostgreSQLStore = require('connect-pg-simple')(session)

const launch_lti = require('./src/assets/launch_lti.js')
const lti = require('ims-lti');

// app.use(cookieParser())

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
})

app.set('trust proxy', 1)

app.use(session({
  secret: process.env.SESSION_SECRET,
  saveUninitialized: false,
  resave: true,
  store: new PostgreSQLStore({
    conString: process.env.DATABASE_URL,
    pool: pool,
    schemaName: 'public',
    tableName: 'session'
  }),
  // cookie: {
  //   secure: true,
  //   maxAge: 6 * 60 * 60 * 1000, // Cookie lasts 6 hours, after which time the assignment must be relaunched
  //   sameSite: 'none',
  //   // domain: 'seif-reader-study.herokuapp.com',
  // }
}))

// Used to parse request data that sent from web pages in JSON format
app.use(express.json())
app.use(express.urlencoded({extended: false}))

// Custom router API for launch URL of app from Canvas
app.post('/launch', launch_lti.handleLaunch);

// Custom router API for posting grade to student's profile
app.post('/postGrade', function(req, res) {
  const provider = new lti.Provider(process.env.CONSUMER_KEY, process.env.CONSUMER_SECRET, new lti.Stores.MemoryStore(), lti.HMAC_SHA1);

  // console.log(req.cookies['connect.sid'])
  // let sid = req.cookies['connect.sid'].substring(2);
  // console.log(sid)

  console.log("Session in /postGrade")
  console.log(req.session)
  console.log(req.sessionID)

  provider.valid_request(req, req.session.canvas_lti_launch_params, (_err, _isValid) => {
      provider.outcome_service.send_replace_result(parseFloat(req.body.score), (_err, _result) => {
        console.log("Graded")
      })
  });

  // console.log(req.cookies.canvas_lti_launch_params);

  // provider.valid_request(req, req.cookies.canvas_lti_launch_params, (_err, _isValid) => {
  //     provider.outcome_service.send_replace_result(parseFloat(req.body.score), (_err, _result) => {
  //       console.log("Graded")
  //     })
  // });
})

// app.get('/givemeasession',function(req,res,next){
//   req.session.mybool = true;
//   req.session.somedata = 'mystring';
//   req.session.evenobjects = { data : 'somedata' };
//   res.send('Session set!');
// });

// app.get('/mysession',function(req,res,next){
//   res.send('My string is '+req.session.somedata+' and my object is '+JSON.stringify(req.session.evenobjects));
// });

app.post('/unlock-testing', function (req, res) {
  pool.connect((err) => {
    if(err) throw err;
    console.log('PostgreSQL Connected');
  })

  pool.query(`UPDATE unlocksections SET unlocked=true WHERE assessment='testing'`, function(err, result) {
    if (err) throw err;
  })
})

app.get('/unlocked-testing', function (req, res) {
  pool.connect((err) => {
    if(err) throw err;
    console.log('PostgreSQL Connected');
  })

  pool.query(`SELECT unlocked FROM unlocksections WHERE assessment='testing'`, function(err, result) {
    console.log(result.rows[0])

    res.status(200).json(result.rows[0])
  })
})

// app.post('/custompage', function(req, res){
//   if(req.session.page_views){
//      req.session.page_views++;
//      res.send("You visited this page " + req.session.page_views + " times");
//   } else {
//      req.session.page_views = 1;
//      res.send("Welcome to this page for the first time!");
//   }
// });

// app.get('/getsession', function(req, res) {
//   res.send(req.session.canvas_lti_launch_params);
// })

app.get('/get-username', (req, res) => {
  var username;

  pool.connect((err) => {
    if(err) throw err;
    console.log('PostgreSQL Connected');
  })

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

app.post('/set-username', (req, res) => {
  // Get sent data.
  var username = req.body.username;

  console.log(username)

  pool.connect((err) => {
    if(err) throw err;
    console.log('PostgreSQL Connected');
  })
  
  // Do a PostgreSQL query
  pool.query("INSERT INTO students(student_id, username) VALUES ($1, $2)", [
    req.session.student_id,
    username
  ], (err, result) => {
    if (err) throw err;

    // pool.end();
  })
})

// Renders HTML file from Simplephy source code
app.use(express.static(path.join(__dirname, 'static')));
app.get('/', function(req, res) {
  res.sendFile(path.join(__dirname, 'static', 'main.html'))  
})

// app.post('/testing', function(req, res) {
//   // Get sent data.
//   // var user = req.body;

//   // Use pattern matching to scrub username input of single quotes bunched together to prevent SQL injection. Checkmake terrorists
//   var username = user.username.replace(/[\']+/, "\'\'");
//   var score = user.score;

//   pool.connect((err) => {
//     if(err) throw err;
//     console.log('PostgreSQL Connected');
//   })

//   // Do a PostgreSQL query
//   pool.query(`INSERT INTO students(username, score) VALUES (\'${username}\', ${score})`, function(err, result) {
//     if (err) throw err;

//     pool.end();
//   })

//   // client.query(`SELECT * FROM students`, function (err, result) {
//   //   if (err) throw err;
//   // })

//   res.end('Success');
// });

// Renders HTML file generated by React build command
app.use(express.static(path.join(__dirname, 'build')));
app.get(/[a-z]+/, function (req, res) {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

// app.get('/getInfo', function (req, res) {
//   const canvas_lti_launch_params = req.cookies.canvas_lti_launch_params;

//   res.status(200).json({canvas_lti_launch_params: canvas_lti_launch_params})
// })

app.listen(port, function(){
  console.log( `Server is listening at http://localhost:${port}`);
})