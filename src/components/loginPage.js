import { Component } from 'react'

import '../assets/loadingAnimation.css'

class LoginPage extends Component {
    constructor() {
        super();

        this.state = {
            score: 1,
            username: null,
            usernameSet: false
        }
    }

    async submitForm(e) {
        e.preventDefault();

        // Display loading animation
        let loader = document.getElementById('loader-wrapper')
        loader.style.visibility = "visible"

        // Add new entry to 'students' database
        await fetch('/users/set-username', {
            method: 'POST',
            body: JSON.stringify({ username: this.state.username }),
            headers: {
                'content-Type': 'application/json'
            }
        })

        // Post grade to student's gradebook to indicate that they have successfully logged in
        await fetch('/lti/post-grade', {
            method: 'POST',
            body: JSON.stringify({ score: this.state.score }),
            headers: {
                'content-Type': 'application/json'
            }
        })

        this.setState({
            usernameSet: true
        })
    }

    usernameExists() {
        if (this.state.usernameSet) {
            return (
                <body>
                    <p>Welcome, <strong>{this.state.username}</strong>. You may now close this page and proceed 
                    to the first assessment</p>
                </body>
            )
        }

        return (
            <div>
                <h1>Welcome to the reader study</h1>
                <h2>Before beginning the assessments, please enter a username using the form below</h2>
                <form onSubmit={this.submitForm.bind(this)}>
                    <input
                        id="user-login"
                        type="text"
                        placeholder="Username"
                        onChange={e => this.setState({ username: e.target.value })}>
                    </input>

                    <button type="submit">Begin</button>
                </form>

                <div id="loader-wrapper" style={{visibility: "hidden"}}>
                    <div id="loader"></div>
                </div>
            </div>
        )
    }

    componentDidMount() {
        fetch('/users/get-username')
            .then(res => {
                if (res.ok) return res.json();
            })
            .then(data => {
                if (data.username) {
                    this.setState({
                        username: data.username,
                        usernameSet: true
                    })
                }
            })
            .catch(err => console.error(err));
    }

    render() {
        return this.usernameExists()
    }
}

export default LoginPage;