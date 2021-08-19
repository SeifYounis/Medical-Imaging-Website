// To set up server, change "start" field in package.json from "react-scripts start" to "node server.js"

// To see heroku console output, do heroku logs --tail

// const https = require('https');
// const fs = require('fs');
// const url = require('url');
// var qs = require('querystring');
// var options = {};
// var sslkey = '/etc/letsencrypt/live/lti.kno.nz/privkey.pem';

// if(fs.existsSync(sslkey)) {  
//   options = {    
//     key: fs.readFileSync(sslkey),    
//     cert: fs.readFileSync('/etc/letsencrypt/live/lti.kno.nz/fullchain.pem')  
//   }
// } else {  
//   options = {    
//     key: fs.readFileSync('./keys/star_netkno_nz.key'),
//     cert: fs.readFileSync('./keys/star_netkno_nz_bundle.crt')  
//   }
// };

// var lti = require('ims-lti');
// var ltiKey = 'myschool.edu';
// var ltiSecret = 'letmein';
// var b = {};
// https.createServer(options, (req, res) => {
//             var q = url.parse(req.url, true);
//             if (req.method === 'POST') {
//                 let body = '';
//                 req.on('data', chunk => {
//                     body += chunk.toString();
//                 });
//                 req.on('end', () => {
//                             b = qs.parse(body);
//                             console.log(b);
//                             var provider = new lti.Provider(ltiKey, ltiSecret);
//                             provider.valid_request(req, b, function(err, isValid) {
//                                         if (err) {
//                                             console.log('Error in LTI Launch:' + err);
//                                             res.end('Pre-Validation Error');
//                                         } else {
//                                             if (!isValid) {
//                                                 console.log('\nError: Invalid LTI launch.');
//                                                 res.end("Invalid LTI launch");
//                                             } else {
//                                                 var rettxt = 'User: ' + b.lis_person_sourcedid + ' (' + b.lis_person_name_full + ')\n' + 'Roles: ' + b.roles + '\n'; 
//                                                 // var retback = '<a href="' + b.launch_presentation_return_url + '">Return</a>';            
//                                                 var retback = '';            
//                                                 if (provider.outcome_service) {              
//                                                   // var score = Math.round( 100*Math.random() ) / 100;              
//                                                   var score = Math.round( 10*Math.random() ) / 10;               
//                                                   provider.outcome_service.send_replace_result(score, function(err, result) {                
//                                                     console.log(result);              
//                                                   });              
//                                                   res.end(rettxt + 'Returning score: ' + score + '\n\n' + retback);            
//                                                 }            
//                                                 else {              
//                                                   res.end(rettxt + 'No outcome service, no score return' + '\n\n' + retback);            
//                                                 }          
//                                               }        
//                                             }      
//                                           });    
//                                         });  
//                                       }  
//                                       else {    
//                                         res.end('Must be launched as an LTI tool provider.  Key/Secret: ' + ltiKey + '/' + ltiSecret);  
//                                       }}).listen(8443)

const https = require('https');
const fs = require('fs');
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

var options = {    
  key: fs.readFileSync('./keys/key.pem'),
  cert: fs.readFileSync('./keys/cert.pem')  
}

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

https.createServer(options, app).listen(port, function(){
  console.log(`Server is listening at http://localhost:${port}`);
});

// app.listen(port, function(){
//   console.log( `Server is listening at http://localhost:${port}`);
// })