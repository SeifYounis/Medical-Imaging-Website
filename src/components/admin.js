import { Component } from "react";
import { io } from "socket.io-client";
import '../styles/admin.css'

// To do:
// Adjust timer
// Adjust number of images
// Control when certain assessments are available

const addRow = (data, users) => {
    console.log(data)

     // console.log(Date.parse(data.date_joined).toString())
     let username, student_id, assessment, date_joined;
     let studentInfo = { student_id, username, assessment, date_joined }

     let row = document.createElement('tr');
     row.setAttribute('id', data.student_id)

     for (let prop in studentInfo) {
         studentInfo[prop] = document.createElement('td');
     }

     studentInfo['student_id'].textContent = data.student_id
     studentInfo['username'].textContent = data.username
     studentInfo['assessment'].textContent = data.assessment
     studentInfo['date_joined'].textContent = data.date_joined

     // console.log(studentInfo)

     for (let prop in studentInfo) {
         row.appendChild(studentInfo[prop])
     }

     users.appendChild(row)
}

class Admin extends Component {
    constructor() {
        super();

        this.socket = io()
    }

    serveHTML(e) {
        alert("Redirecting you to test results")

        // fetch('/scripts/serve-html')
        //     .then(res => {
        //         if (res.ok) return res.text();
        //     })
        //     .then(data => {
        //         console.log(data)
        //     })
        //     .catch(err => console.error(err));
    }

    unlockTesting(e) {
        e.preventDefault();

        alert('Testing Unlocked')

        // fetch('/unlock-testing', {
        //     method: 'POST',
        // })
    }

    componentDidMount() {
        let users = document.getElementById("ac-table")

        // When the admin first connects, fetch active connections from database
        fetch('/admin/get-active-connections')
            .then(res => {
                if (res.ok) return res.json();
            })
            .then(conn => {
                conn.forEach(data => {
                   addRow(data, users)
                });

                // console.log(conn)
            })
            .catch(err => console.error(err));

        this.socket.emit('connect-admin');

        this.socket.on('new user', (user) => {
           addRow(user, users)

            // console.log('We got a new student')
            // console.log(student)
        })

        this.socket.on('remove user', (student) => {
            console.log("We're deleting a user")
            console.log(student)

            let user = document.getElementById(student.id)
            user.remove()
        })
    }

    // componentWillUnmount() {
    //     this.socket.close()
    // }

    render() {
        return (
            <div className="admin-page">
                <h1>Admin Page</h1>

                {/* <ul id="users-list">
                </ul>*/}
                <a href="/final-results" target="_blank">
                    <button onClick={this.serveHTML.bind(this)}>
                        Click to serve HTML
                    </button>
                </a>

                <fieldset id="unlock-tests">
                    <legend>Unlock Assessments</legend>
                    <button onClick={this.unlockTesting.bind(this)}>Unlock Testing</button>
                    <button>Unlock Training</button>
                    <button>Unlock Rating</button>
                    <button>Unlock 2AFC</button>
                </fieldset>

                <br />

                {/* <div className="table-wrapper"> */}
                <table id="ac-table" border='1' style={{ marginLeft: '5vw' }}>
                    <tr>
                        <th colSpan={4} style={{ fontSize: '3vh' }}>Active Connecions</th>
                    </tr>
                    <tr>
                        <th colSpan={2} style={{ width: '50vw' }}>
                            Student<br />
                        </th>
                        <th style={{ width: '20vw' }}></th>
                        <th style={{ width: '20vw' }}></th>
                    </tr>
                    <tr>
                        <th>Student ID</th>
                        <th>Username</th>
                        <th>Assessment</th>
                        <th>Date Joined</th>
                    </tr>
                </table>
                {/* </div> */}

                <br />

                <fieldset id="ac-search">
                    <legend>Search Active Connections</legend>
                    <label>Search students by username: </label>
                    <input type="text" id="username-search" placeholder="Search usernames.."></input>

                    <label>Search students by ID: </label>
                    <input type="text" id="id-search" placeholder="Search ID's.."></input>

                    <label><input type="checkbox"></input>Testing </label>
                    <label><input type="checkbox"></input>Training </label>
                    <label><input type="checkbox"></input>Rating </label>
                    <label><input type="checkbox"></input>2AFC </label>

                </fieldset>

                {/* <button onClick={this.serveHTML.bind(this)}>
                    Click here to render HTML
                </button> */}
            </div >
        )
    }
}

export default Admin