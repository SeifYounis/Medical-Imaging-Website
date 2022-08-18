/**
 * Code for connecting to PostgreSQL database
 */

const { Pool } = require('pg')
let pool;

function connectToDB() {
    if(!pool) {
        // Create and connect a new PostgreSQL database connection pool
        pool = new Pool({
            connectionString: process.env.APP_DATABASE_URL,
            ssl: {
                rejectUnauthorized: false
            }
        })

        pool.connect((err) => {
            if(err) throw err;
            console.log('PostgreSQL Connected');
        })
    }

    return pool
}

module.exports = connectToDB()


