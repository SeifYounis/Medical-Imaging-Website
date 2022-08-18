/**
 * Router functions to get username from and set username in database
 */

const pool = require('../../util/db');

exports.getUsername = async (req, res) => {
    if (req.session.username) {
        return res.status(200).json({ username: req.session.username });
    }

    // Retrieve username from database given student ID
    const { rows } = await pool.query('SELECT username FROM students WHERE student_id=$1', [req.session.student_id])

    let retrieved

    if (rows[0]) {
        retrieved = JSON.stringify(rows[0]);
        retrieved = JSON.parse(retrieved);
        
        req.session.username = retrieved.username;

        console.log(req.session.username)

        return res.status(200).json(retrieved);
    }

    return res.status(200).json({ username: null })
}

exports.setUsername = (req, res) => {
    let username = req.body.username

    req.session.username = username;

    // Add user's student ID and username to database
    pool.query("INSERT INTO students(student_id, username) VALUES ($1, $2)", [
        req.session.student_id,
        username
    ], (err, result) => {
        if (err) throw err;

        return res.status(200).send('Username successfully added');
    })
}