/**
 * Route handler for running Python script to retrieve results from database
 * and generate HTML results display
 */

const express = require('express')
const router = express.Router()
const { spawn } = require('child_process');

router.post('/display-results', (req, res) => {
    let dataToSend;

    let sessionID = req.sessionID;
    let studentid = req.session.student_id;
    let username = req.session.username;
    let assessment = req.body.assessment;

    // const py = spawn('python', ['./scripts/analyzeD.py', "Self-guided", "testing1",  "kne006", "628fa959fbd2a85a0d11892acddde75a5a40eab5", 
    // "4RTf1KIMBUypnHxqC1vM9DTFwDCfLKA5"])

    // spawn new child process to call the python script
    const py = spawn('python', ['./scripts/analyzeD.py', "Self-guided", assessment,  username, studentid, sessionID])

    py.stdout.on('data', function (data) {
        dataToSend = data.toString();
    });

    // in close event we are sure that stream from child process is closed
    py.on('close', (code) => {
        console.log(`child process close all stdio with code ${code}`);
        
        // send data to browser
        res.send(dataToSend)
    });
})

module.exports = router
