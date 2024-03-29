import { Component } from "react";
import { io } from "socket.io-client";

import Table from "./Table";
import tableStyles from "./Table/Table.module.css";

// async function displayResults (url) {
//     const serveHTML = await fetch("/scripts/serve-html")

//     const newWindow = window.open(url, '_blank', 'noopener,noreferrer')
//     if (newWindow) newWindow.opener = null
// }

/**
 * Instructor page to control assessment flow and adjust settings. Guided only.
 */
class Admin extends Component {
    constructor() {
        super();

        this.state = {
            // Assessments unlocked
            trainingUnlocked: false,
            testing1Unlocked: false,
            testing2Unlocked: false,
            ratingUnlocked: false,
            AFCUnlocked: false,

            // Number of students in each section
            numTrainingStudents: 0,
            numTestingStudents1: 0,
            numTestingStudents2: 0,
            numRatingStudents: 0,
            num2AFCStudents: 0,

            // Assessment config info
            timeLimit: 0,
            secondsVisible: 0,
            numImages: 0,

            isDisabled: true
        }

        this.socket = io()
    }

    // Add row to table of active student connections and updates number of students in section
    addRow = (data, users) => {
        let countToUpdate;

        // console.log(data.current_test)

        if (data.current_test === "testing1") {
            countToUpdate = "numTestingStudents1"
        } else if (data.current_test === "testing2") {
            countToUpdate = "numTestingStudents2"
        } else if (data.current_test === "training") {
            countToUpdate = "numTrainingStudents"
        } else if (data.current_test === "rating") {
            countToUpdate = "numRatingStudents"
        } else if (data.current_test === "2AFC") {
            countToUpdate = "num2AFCStudents"
        }

        // Increment count and add student to table
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

    // Emit event to unlock assessment to web socket server and pass in configuration
    unlockAssessment(assessment) {
        console.log(assessment)

        this.setState({
            // [assessment.replace('2', '') + "Unlocked"]: true
            [assessment + "Unlocked"]: true
        }, () => {
            // console.log(this.state[assessment.replace('2', '') + "Unlocked"])
            console.log(this.state[assessment + "Unlocked"])
        })

        if(assessment !== '2AFC') {
            this.socket.emit(`unlock ${assessment}`, {
                timeLimit: this.state.timeLimit,
                secondsVisible: this.state.secondsVisible,
                numImages: this.state.numImages
            })
        } else {
            this.socket.emit('unlock 2AFC', {
                numImages: this.state.numImages
            })
        }

        alert(assessment.charAt(0).toUpperCase() + assessment.slice(1) + " Unlocked")
    }

    configTests(e) {
        e.preventDefault()

        this.setState({
            timeLimit: Number(e.target.timeLimit.value),
            secondsVisible: Number(e.target.secondsVisible.value),
            numImages: Number(e.target.numImages.value),
            isDisabled: false
        }, () => alert('Settings saved'))
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
            .catch(err => console.log("Failed to retrieve active connections"));

        this.socket.emit('connect-admin');

        // Handle new user connection
        this.socket.on('new user', (user) => {
            if (user) {
                let assessment = user.current_test

                this.addRow(user, users)

                // If admin has set tests to unlocked, then allow incoming users to access test right away
                if(this.state[assessment + "Unlocked"] === true) {
                    if(assessment !== '2AFC') {
                        this.socket.emit(`unlock ${assessment}`, {
                            timeLimit: this.state.timeLimit,
                            secondsVisible: this.state.secondsVisible,
                            numImages: this.state.numImages
                        })
                    } else {
                        this.socket.emit('unlock 2AFC', {
                            numImages: this.state.numImages
                        })
                    }
                }
            } else {
                console.log("Socket sent blank data in new user")
            }
        })

        // Remove active connection. Delete row and update count
        this.socket.on('remove user', (student) => {
            let countToUpdate;

            if (student.current_test.includes("testing1")) {
                countToUpdate = "numTestingStudents1"
            } else if (student.current_test.includes("testing2")) {
                countToUpdate = "numTestingStudents2"
            } else if (student.current_test.includes("training")) {
                countToUpdate = "numTrainingStudents"
            } else if (student.current_test.includes("rating")) {
                countToUpdate = "numRatingStudents"
            } else if (student.current_test.includes("2AFC")) {
                countToUpdate = "num2AFCStudents"
            }

            this.setState({ [countToUpdate]: this.state[countToUpdate] - 1 }, () => {
                // console.log(student)

                let user = document.getElementById(student.id)
                user?.remove()
            })
        })
    }

    render() {
        return (
            <div className="admin-page">
                <h1>Admin Page</h1>

                <fieldset id="config-tests">
                    <legend>Configure Assessments</legend>

                    <form onSubmit={this.configTests.bind(this)}>
                        <label htmlFor="timeLimit">Enter a time limit for each question: {' '}
                            <input
                                type="number"
                                name="timeLimit"
                                min={0}
                                placeholder="10 seconds"
                                required>
                            </input>
                        </label>
                        <br />

                        <label htmlFor="secondsVisible">Number of seconds image is visible: {' '}
                            <input
                                type="number"
                                name="secondsVisible"
                                min={0}
                                placeholder="5 seconds"
                                required>
                            </input>
                        </label>

                        <br />

                        <label htmlFor="numImages">Number of images: {' '}
                            <select id="numImages">
                                <option value={10}>10</option>
                                <option value={20}>20</option>
                                <option value={30}>30</option>
                                <option value={40}>40</option>
                                <option value={50}>50</option>
                                <option value={60}>60</option>
                            </select>
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
                        onClick={() => this.unlockAssessment("training")}
                        disabled={this.state.isDisabled}>
                        Unlock Training</button>
                    <span> Students in training section: {this.state.numTrainingStudents}</span>
                    <br />

                    <button
                        className="unlockButton"
                        onClick={() => this.unlockAssessment("testing1")}
                        disabled={this.state.isDisabled}>
                        Unlock Testing 1</button>
                    <span> Students in testing 1 section: {this.state.numTestingStudents1}</span>
                    <br />

                    <button
                        className="unlockButton"
                        onClick={() => this.unlockAssessment("testing2")}
                        disabled={this.state.isDisabled}>
                        Unlock Testing 2</button>
                    <span> Students in testing 2 section: {this.state.numTestingStudents2}</span>
                    <br />

                    <button
                        className="unlockButton"
                        onClick={() => this.unlockAssessment("rating")}
                        disabled={this.state.isDisabled}>
                        Unlock Rating</button>
                    <span> Students in rating section: {this.state.numRatingStudents}</span>
                    <br />

                    <button
                        className="unlockButton"
                        onClick={() => this.unlockAssessment("2AFC")}
                        disabled={this.state.isDisabled}>
                        Unlock 2AFC</button>
                    <span> Students in 2AFC section: {this.state.num2AFCStudents}</span>
                    <br />
                </fieldset>

                <br />

                {/* <fieldset id="get-results">
                    <legend>Get Results</legend>

                    <button onClick={() => displayResults('/test-display')}>Serve HTML</button>
                </fieldset> */}

                <Table />
            </div >
        )
    }
}

export default Admin