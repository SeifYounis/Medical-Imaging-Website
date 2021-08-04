// To set up server, change "start" field in package.json from "react-scripts start" to "node server.js"

const express = require('express')
const favicon = require('express-favicon')
const path = require('path')
const port = process.env.PORT || 3000;
const app = express()
const {Client} = require('pg')
require('dotenv').config()
//const mysql = require('mysql')

// Create connection
const client = new Client({
  connectionString: process.env.REACT_APP_DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

client.connect((err) => {
  if(err) throw err;
  console.log('PostgreSQL Connected');
})

// Create connection
// const db = mysql.createConnection({
//   host     : 'localhost',
//   user     : 'root',
//   password : '/!A8Y05s3*D[VHMH',
//   database : 'reader study'
// });

// Connect
// db.connect((err) => {
//   if(err) throw err;
//   console.log('MySql Connected...');
// });

// the __dirname is the current directory from where the script is running
app.use(express.static(__dirname));
app.use(express.static(path.join(__dirname, 'build')));
app.use(favicon(__dirname + '/build/favicon.ico'));

// Used to interpret data that are sent from web pages in JSON format
app.use(express.json())

app.get('/*', function (req, res) {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

app.post('/testing', function(req, res) {
  // Get sent data.
  var user = req.body;

  // Scrub username input of single quotes bunched together to prevent SQL injection. Checkmake terrorists
  var username = user.username.replace(/[\']+/, "\'\'");
  var score = user.score;

  console.log([username, score]);

  // Do a PostgreSQL query
  client.query(`INSERT INTO students(username, score) VALUES (\'${username}\', ${score})`, function(err, result) {
    if (err) throw err;

    client.end();
  })

  // Do a MySQL query.
  // db.query('INSERT INTO students SET ?', user, function(err, result) {
  //   if (err) throw err;
  // });
  
  res.end('Success');
});

app.listen(port, function(){
  console.log( `Server is listening at http://localhost:${port}`);
})