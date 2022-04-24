/**
 * Server entry point
 * */ 
const app = require('./main')
const port = process.env.PORT || 4000;

const server = app.listen(port, function () {
  console.log(`Server is listening at port ${port}`);
})
const io = require('socket.io')(server);

require('./socket')(io)