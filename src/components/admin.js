import { Component } from "react";
import { io } from "socket.io-client";

// Adjust timer
// Adjust number of images
// Control when certain assessments are available

class Admin extends Component {
    socket = io();

    unlockTesting(e) {
        e.preventDefault();

        fetch('/unlock-testing', {
            method: 'POST',
        })
    }

    componentDidMount() {
        let users = document.getElementById("users-list")

        fetch('/admin/get-active-connections')
        .then(res => {
            if(res.ok) return res.json();
        })
        .then(data => {
            console.log(data)
        })
        .catch(err => console.error(err));

        this.socket.emit('connect-admin');

        this.socket.on('new user', (student) => {
            let user = document.createElement('li')

            user.setAttribute('id', student.student_id)
            user.textContent = student.username + ', ' + student.student_id + ', ' + student.assessment

            users.appendChild(user)

            console.log('We got a new student')
            console.log(student)
        })
        
        this.socket.on('remove user', (student) => {
            console.log("We're deleting a user")
            console.log(student)

            let user = document.getElementById(student.id)
            user.remove()
        })
    }

    render() {
        return (
            <body>
                <h1>List of Users</h1>
                <ul id="users-list">
                </ul>
                {/* <button onClick={this.unlockTesting.bind(this)}>
                    Unlock Testing
                </button> */}
            </body>
        )
    }
}

export default Admin