require('dotenv').config()

const path = require('path')
const { spawn } = require('child_process');

const express = require('express')
const app = express()

const users = require('./server/routes/users')
const lti = require('./server/routes/lti')
const adminRouter = require('./server/routes/adminRouter')

const pool = require('./util/db')
const sess = require('./util/session')

app.set('trust proxy', 1)

// app.use(cookieParser())
app.use(sess)

// Used to parse request data that sent from web pages in JSON format
app.use(express.json())
app.use(express.urlencoded({ extended: false }))

app.use('/users', users)
app.use('/lti', lti)
app.use('/admin', adminRouter)

app.post('/add-selection', (req, res) => {
    console.log(req.body)

    /**
     * Create new entry in 'results' table in database
     * Answer_date is of type 'timestamp with time zone' in PostgreSQL.
     */
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

        res.send('Selection successfully added')
    })
})

// As an admin, unlock the testing section for students to take
app.post('/unlock-testing', function (req, res) {
    pool.query(`UPDATE unlocksections SET unlocked=true WHERE assessment='testing'`, function (err, result) {
        if (err) throw err;
    })
})

// Check if admin has granted access to the testing section
app.get('/unlocked-testing', function (req, res) {
    pool.query(`SELECT unlocked FROM unlocksections WHERE assessment='testing'`, function (err, result) {
        console.log(result.rows[0])

        res.status(200).json(result.rows[0])
    })
})

app.get('/serve-html', (req, res) => {
    let dataToSend;
    // spawn new child process to call the python script
    const py = spawn('python', ['./scripts/serve_html.py']);

    py.stdin.write(JSON.stringify({username: "seif"}));

    py.stdin.end();

    // collect data from script
    py.stdout.on('data', function (data) {
        console.log('Pipe data from python script ...');
        dataToSend = data.toString();
    });

    // in close event we are sure that stream from child process is closed
    py.on('close', (code) => {
        console.log(`child process close all stdio with code ${code}`);
        
        console.log(dataToSend)

        // send data to browser
        res.send(dataToSend)
    });
})

// Renders HTML file from Simplephy source code
app.use(express.static(path.join(__dirname, 'static')));
app.get('/', function (req, res) {
    res.sendFile(path.join(__dirname, 'static', 'main.html'))
})

// Renders HTML file generated by npm build command
app.use(express.static(path.join(__dirname, 'build')));
app.get(/[a-z]+/, function (req, res) {
    res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

module.exports = app