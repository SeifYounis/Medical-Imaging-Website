/**
 * Retrieve all users that have opened an assessment
 */

const express = require('express')
const router = express.Router()

const pool = require('../../util/db')

router.get('/get-active-connections', (req, res) => {
    pool.query(`SELECT * FROM active_connections WHERE date_disconnected IS NULL`, (err, result) => {
        res.status(200).json(result.rows)
    })
})

module.exports = router