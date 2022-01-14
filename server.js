const app = require('./main')
const port = process.env.PORT || 4000;

// const { Server } = require('ws');

const pool = require('./util/db')
const sess = require('./util/session')

const server = app.listen(port, function () {
  console.log(`Server is listening at port ${port}`);
})
const io = require('socket.io')(server);

io.use(function (socket, next) {
  sess(socket.request, socket.request.res || {}, next);
});

io.on('connection', (socket) => {
  socket.on('connect-admin', () => {
    socket.join('admin')
  })

  console.log(`Connected. Here is the session`)
  let session = socket.request.session
  console.log(session)

  socket.on('new user', (data) => {
    io.to("admin").emit("new user", {
      student_id: session.student_id,
      username: data.username,
      assessment: data.assessment
    });
  })

  // session.number = 47;
  // session.save()

  socket.on('disconnect', () => {
    console.log("Disconnected")

    pool.query("UPDATE active_connections SET active=$1 WHERE session_id=$2", [
      false,
      session.id
    ], (err, result) => {
      if (err) throw err;

      io.to("admin").emit('remove user', {
        id: session.student_id
      })
    })
  })
});

/**
 * Primary reference for capturing session data through web sockets
 * https://github.com/websockets/ws/blob/master/examples/express-session-parse/index.js
 */
// const wss = new Server({ noServer: true })

// server.on('upgrade', function (request, socket, head) {
//   // console.log('Parsing session from request...');

//   sess(request, {}, () => {
//     if (!request.sessionID) {
//       socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n');
//       socket.destroy();
//       return;
//     }

//     // console.log('Session is parsed!');

//     wss.handleUpgrade(request, socket, head, function (ws) {
//       wss.emit('connection', ws, request);
//     });
//   });
// });

// wss.on('connection', (ws, req) => { 
//   console.log('Connected')

//   ws.on('close', () => {
//     console.log('Connection closed.')

//     pool.query("UPDATE active_connections SET active=$1 WHERE session_id=$2", [
//       false,
//       req.sessionID
//     ], (err, result) => {
//       if (err) throw err;
//     })
//   });
// });