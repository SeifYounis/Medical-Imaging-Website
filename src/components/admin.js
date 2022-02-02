import { Component } from "react";
import { io } from "socket.io-client";

import Table from "./Table";
import tableStyles from "./Table/Table.module.css";

// To do:
// Adjust timer
// Adjust number of images
// Control when certain assessments are available

class Admin extends Component {
    constructor() {
        super();

        this.state = {
            numTestingStudents: 0,
            numTrainingStudents: 0,
            numRatingStudents: 0,
            num2AFCStudents: 0,
            timeLimit: 0,
            secondsVisible: 0,
            isDisabled: true
        }

        this.socket = io()
    }

    // Add row to table of active student connections and updates number of students in section
    addRow = (data, users) => {
        let countToUpdate;

        if (data.current_test === "testing") {
            countToUpdate = "numTestingStudents"
        } else if (data.current_test === "training") {
            countToUpdate = "numTrainingStudents"
        } else if (data.current_test === "rating") {
            countToUpdate = "numRatingStudents"
        } else if (data.current_test === "2AFC") {
            countToUpdate = "num2AFCStudents"
        }

        this.setState({ [countToUpdate]: this.state[countToUpdate] + 1 }, () => {
            let username, student_id, current_test, date_joined;
            let studentInfo = { student_id, username, current_test, date_joined }

            let row = document.createElement('tr');
            row.setAttribute('id', data.student_id)
            row.setAttribute('class', tableStyles.tableRowItems)

            for (let prop in studentInfo) {
                studentInfo[prop] = document.createElement('td');
                studentInfo[prop].setAttribute('class', tableStyles.tableCell)
            }

            studentInfo['student_id'].textContent = data.student_id
            studentInfo['username'].textContent = data.username
            studentInfo['current_test'].textContent = data.current_test
            studentInfo['date_joined'].textContent = new Date(data.date_joined).toLocaleString()

            for (let prop in studentInfo) {
                row.appendChild(studentInfo[prop])
            }

            users.appendChild(row)
        })
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
        // e.preventDefault();
        this.socket.emit('unlock testing', {
            timeLimit: this.state.timeLimit,
            secondsVisible: this.state.secondsVisible
        })
        alert('Testing Unlocked')
    }

    unlockTraining(e) {
        this.socket.emit('unlock training', {
            timeLimit: this.state.timeLimit,
            secondsVisible: this.state.secondsVisible
        })
        
        alert('Training Unlocked')
    }

    unlockRating(e) {
        this.socket.emit('unlock rating', {
            timeLimit: this.state.timeLimit,
            secondsVisible: this.state.secondsVisible
        })

        alert('Rating Unlocked')
    }

    unlock2AFC(e) {
        this.socket.emit('unlock 2AFC')
        alert('2AFC Unlocked')
    }

    configTests(e) {
        e.preventDefault()

        this.setState({
            timeLimit: Number(e.target.timeLimit.value),
            secondsVisible: Number(e.target.secondsVisible.value),
            isDisabled: false
        }, () => {
            // let buttons = document.getElementsByClassName('unlockButton');

            // for (let button of buttons) {
            //     button.removeAttribute('disabled')
            // }

            alert('Settings saved');
        })
    }

    componentDidMount() {
        let users = document.getElementById("active-users")

        // When the admin first connects, fetch active connections from database
        fetch('/admin/get-active-connections')
            .then(res => {
                if (res.ok) return res.json();
            })
            .then(conn => {
                conn.forEach(data => {
                    this.addRow(data, users)
                });
            })
            .catch(err => console.error(err));

        this.socket.emit('connect-admin');

        this.socket.on('new user', (user) => {
            this.addRow(user, users)
        })

        // Remove active connection event. Delete row and update count
        this.socket.on('remove user', (student) => {
            let countToUpdate;

            if (student.current_test === "testing") {
                countToUpdate = "numTestingStudents"
            } else if (student.current_test === "training") {
                countToUpdate = "numTrainingStudents"
            } else if (student.current_test === "rating") {
                countToUpdate = "numRatingStudents"
            } else if (student.current_test === "2AFC") {
                countToUpdate = "num2AFCStudents"
            }

            this.setState({ [countToUpdate]: this.state[countToUpdate] - 1 }, () => {
                // console.log(student)

                let user = document.getElementById(student.id)
                user.remove()
            })
        })
    }

    render() {
        return (
            <div className="admin-page">
                <h1>Admin Page</h1>

                {/* <a href="/final-results" target="_blank">
                    <button onClick={this.serveHTML.bind(this)}>
                        Click to serve HTML
                    </button>
                </a> */}

                <fieldset id="config-tests">
                    <legend>Configure Assessments</legend>

                    <form onSubmit={this.configTests.bind(this)}>
                        <label>Enter a time limit for each question: {' '}
                            <input
                                type="number"
                                name="timeLimit"
                                min={0}
                                placeholder="10 seconds"
                                required>
                            </input>
                        </label>

                        <br />

                        <label>Number of seconds image is visible: {' '}
                            <input
                                type="number"
                                name="secondsVisible"
                                min={0}
                                placeholder="5 seconds"
                                required>
                            </input>
                        </label>

                        <br />

                        <button type="submit">Confirm</button>
                    </form>
                </fieldset>

                <br />

                <fieldset id="unlock-tests">
                    <legend>Unlock Assessments</legend>

                    <button 
                        className="unlockButton" 
                        onClick={this.unlockTesting.bind(this)}
                        disabled={this.state.isDisabled}
                        >Unlock Testing</button>
                    <span> Students in testing section: {this.state.numTestingStudents}</span>
                    <br />

                    <button className="unlockButton" onClick={this.unlockTraining.bind(this)} disabled={this.state.isDisabled}>Unlock Training</button>
                    <span> Students in training section: {this.state.numTrainingStudents}</span>
                    <br />

                    <button className="unlockButton" onClick={this.unlockRating.bind(this)} disabled={this.state.isDisabled}>Unlock Rating</button>
                    <span> Students in rating section: {this.state.numRatingStudents}</span>
                    <br />

                    <button className="unlockButton" onClick={this.unlock2AFC.bind(this)} disabled={this.state.isDisabled}>Unlock 2AFC</button>
                    <span> Students in 2AFC section: {this.state.num2AFCStudents}</span>
                    <br />
                </fieldset>

                <br />

                <Table />

                {/* <br />

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

                </fieldset> */}
            </div >
        )
    }
}

export default Admin