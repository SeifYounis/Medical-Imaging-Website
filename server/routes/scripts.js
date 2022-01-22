const express = require('express')
const router = express.Router()
const { spawn } = require('child_process');

router.get('/serve-html', (req, res) => {
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

module.exports = router
