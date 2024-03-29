/**
 * Code for tracking user sessions
 */

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
const pool = require('./db')

const session = require('express-session');
const PostgreSQLStore = require('connect-pg-simple')(session);

let sess;

function initializeSession() {
    if (!sess) {
        sess = session({
            secret: process.env.SESSION_SECRET,
            saveUninitialized: false,
            resave: false,
            store: new PostgreSQLStore({
                conString: process.env.DATABASE_URL,
                pool: pool,
                schemaName: 'public',
                tableName: 'session'
            }),
            // cookie: {
            //     maxAge: 60 * 60 * 1000, // Cookie lasts 1 hour, after which time the user must log in again
            // }
        })
    }

    return sess;
}

module.exports = initializeSession()



