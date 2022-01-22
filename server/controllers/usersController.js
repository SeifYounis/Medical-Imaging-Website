const pool = require('../../util/db');

exports.getUsername = (req, res) => {
    if(req.session.username) {
        return res.status(200).json({username: req.session.username});
    }

    // Do a PostgreSQL query
    pool.query("SELECT username FROM students WHERE student_id=$1", [
        req.session.student_id
    ], (err, result) => {
        if (err) throw err;

        let retrieved = result.rows[0]

        if (retrieved) {
            let username;

            retrieved = JSON.stringify(retrieved);
            retrieved = JSON.parse(retrieved);
            username = retrieved.username;

            req.session.username = username;

            return res.status(200).json(retrieved);
        }

        return res.status(200).json({ username: null })
    })
}

exports.setUsername = (req, res) => {
    let username = req.body.username

    req.session.username = username;

    // Do a PostgreSQL query
    pool.query("INSERT INTO students(student_id, username) VALUES ($1, $2)", [
        req.session.student_id,
        username
    ], (err, result) => {
        if (err) throw err;

        return res.status(200).send('Username successfully added');
    })
}