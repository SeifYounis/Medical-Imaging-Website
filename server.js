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
const {spawn} = require('child_process');
const port = process.env.PORT || 3000;

const express = require('express')
const session = require('express-session');
const app = express()

const {Pool} = require('pg')
const { Server } = require('ws');
const PostgreSQLStore = require('connect-pg-simple')(session)

const launch_lti = require('./src/assets/launch_lti.js')
const lti = require('ims-lti');

var server = app.listen(port, function(){
  console.log( `Server is listening at http://localhost:${port}`);
})

const wss = new Server({server})

// wss.on('connection', (ws) => {
//   console.log('Client connected');

//   // wss.clients.forEach((client) => {
//   //   client.send("Did you get this?");
//   // });

//   // console.log(wss.clients.size);

//   ws.on('close', () => console.log('Client disconnected'));
// });

// app.use(cookieParser())

// Create and connect a new PostgreSQL database connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
})
pool.connect((err) => {
  if(err) throw err;
  console.log('PostgreSQL Connected');
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

app.post('/add-selection', (req, res) => {
  console.log(req.body)

  /* Answer_date is of type 'timestamp with time zone' in PostgreSQL.*/
  pool.query("INSERT INTO results(session_id, student_id, username, assessment, prompt_image, answer, solution, answer_date) \
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8)", [
      req.sessionID,
      req.session.student_id,
      req.session.username,
      req.body.assessment,
      req.body.promptImage,
      req.body.answer,
      req.body.solution,
      req.body.answerDate,
  ], (err, result) => {
    if (err) throw err;
  })

  res.status(200).send();
})

// As an admin, unlock the testing section for students to take
app.post('/unlock-testing', function (req, res) {
  pool.query(`UPDATE unlocksections SET unlocked=true WHERE assessment='testing'`, function(err, result) {
    if (err) throw err;
  })
})

// Check if admin has granted access to the testing section
app.get('/unlocked-testing', function (req, res) {
  pool.query(`SELECT unlocked FROM unlocksections WHERE assessment='testing'`, function(err, result) {
    console.log(result.rows[0])

    res.status(200).json(result.rows[0])
  })
})

app.get('/get-username', (req, res) => {
  var username;

  // Do a PostgreSQL query
  pool.query("SELECT username FROM students WHERE student_id=$1", [
    req.session.student_id
  ], (err, result) => {
    if (err) throw err;

    username = result.rows[0]

    if(!username) {
      res.status(200).json({username: null})
    } else {
      pool.query("INSERT INTO active_connections(session_id, student_id, username) VALUES($1, $2, $3)", [
        req.sessionID,
        req.session.student_id,
        req.session.username,
      ], (err, result) => {
        if (err) throw err;

        res.status(200).json(username);
      })
    }
  })
})

app.post('/set-username', (req, res) => {
  // Get sent data.
  var username = req.body.username;

  console.log(username)
  
  // Do a PostgreSQL query
  pool.query("INSERT INTO students(student_id, username) VALUES ($1, $2)", [
    req.session.student_id,
    username
  ], (err, result) => {
    if (err) throw err;

    pool.query("INSERT INTO active_connections(session_id, student_id, username) VALUES($1, $2, $3)", [
      req.sessionID,
      req.session.student_id,
      req.session.username,
    ], (err, result) => {
      if (err) throw err;
    })

    // pool.end();
  })
})

// Renders HTML file from Simplephy source code
app.use(express.static(path.join(__dirname, 'static')));
app.get('/', function(req, res) {
  res.sendFile(path.join(__dirname, 'static', 'main.html'))  
})

app.get('/test-python', (req, res) => {
  var dataToSend;
  // spawn new child process to call the python script
  const python = spawn('python', ['./src/assets/test.py']);
  // collect data from script
  python.stdout.on('data', function (data) {
   console.log('Pipe data from python script ...');
   dataToSend = data.toString();
  });
  // in close event we are sure that stream from child process is closed
  python.on('close', (code) => {
  console.log(`child process close all stdio with code ${code}`);
  // send data to browser
  res.send(dataToSend)
  });  
})

app.get('/test-nested-queries', (req, res) => {
  pool.query("INSERT INTO students(student_id, username) VALUES ($1, $2)", [
    "test-id",
    "test-username"
  ], (err, result) => {
    if (err) throw err;

    pool.query("SELECT * FROM students", (err, result) => {
      if (err) throw err;

      res.send(result.rows)
    })
  })
})


// pool.query(`SELECT * FROM students`, function (err, result) {
//   if (err) throw err;
// })

// Renders HTML file generated by React build command
app.use(express.static(path.join(__dirname, 'build')));
app.get(/[a-z]+/, function (req, res) {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});