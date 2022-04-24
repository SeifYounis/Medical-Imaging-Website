const pool = require('./util/db')
const sess = require('./util/session')

module.exports = (io) => {
    io.use(function (socket, next) {
        sess(socket.request, socket.request.res || {}, next);
    });
    
    io.on('connection', (socket) => {
        socket.on('connect-admin', () => {
            socket.join('admin')
        })
    
        // console.log(io.sockets.adapter.rooms.get('user').size)
    
        console.log(`Connected. Here is the session`)
        let session = socket.request.session
        console.log(session)
    
        socket.on('new user', (data) => {
            // Assign user to either group A or B
            let assignGroup = (min, max) => {
                let num = Math.random() * (max - min) + min;
    
                return Math.round(num);
            };
    
            // Student's web socket will join current assessment and group to be assigned if doing the training section
            let room = data.assessment === 'training' ? data.assessment + (assignGroup(1, 2) == 1 ? "A" : "B") : data.assessment
            socket.join(room)
    
            io.to("admin").emit("new user", {
                student_id: session.student_id,
                username: data.username,
                // username: session.username,
                current_test: data.assessment,
                date_joined: data.joined
            });
    
            // Create new entry in 'active_connections' table in database
            pool.query(`
        INSERT INTO active_connections (session_id, student_id, username, current_test, date_joined)
        VALUES ($1, $2, $3, $4, $5)
        ON CONFLICT (session_id) DO NOTHING`, [
                session.id,
                session.student_id,
                data.username,
                // session.username,
                data.assessment,
                data.joined
            ], (err, result) => {
                if (err) throw err;
            })
        })
    
        socket.on('unlock training', (configInfo) => {
            io.to('trainingA').emit('unlock training', configInfo, "A")
            io.to('trainingB').emit('unlock training', configInfo, "B")
        })
    
        socket.on('unlock testing1', (configInfo) => {
            io.to("testing1").emit('unlock testing', configInfo)
        })
    
        socket.on('unlock testing2', (configInfo) => {
            io.to("testing2").emit('unlock testing', configInfo)
        })
    
        socket.on('unlock rating', (configInfo) => {
            io.to('rating').emit('unlock rating', configInfo)
        })
    
        socket.on('unlock 2AFC', (configInfo) => {
            io.to('2AFC').emit('unlock 2AFC', configInfo)
        })
    
        socket.on('disconnecting', () => {
            let [, room] = socket.rooms
            console.log(`Disconnected. Socket has left ${room}`)
    
            io.to("admin").emit('remove user', {
                id: session.student_id,
                current_test: room
            })
    
            pool.query("UPDATE active_connections SET date_disconnected=$1 WHERE session_id=$2", [
                new Date().toLocaleString(),
                session.id
            ], (err, result) => {
                if (err) throw err;
            })
        })
    });
}

/**
 * Primary reference for capturing session data through web sockets
 * https://github.com/websockets/ws/blob/master/examples/express-session-parse/index.js
 */
// const { Server } = require('ws');
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

// setInterval(() => {
//   wss.clients.forEach((client) => {
//     client.send(new Date().toTimeString());
//   });
// }, 1000);