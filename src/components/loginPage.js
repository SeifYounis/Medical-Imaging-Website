import { Component } from 'react'

class LoginPage extends Component {
    constructor() {
        super();

        this.state = {
            score: 1,
            username: null,
            usernameSet: false
        }
    }

    submitForm(e) {
        e.preventDefault();

        // Add new entry to 'students' database
        fetch('/users/set-username', {
            method: 'POST',
            body: JSON.stringify({username: this.state.username}),
            headers: {
                'content-Type': 'application/json'
            },
        }).then(function (response) {
            return response
        }).then(function (body) {
            console.log(body);
        });

        this.setState({
            usernameSet: true
        })

        // Post grade to student's gradebook to indicate that they have successfully logged in
        fetch('/lti/post-grade', {
            method: 'POST',
            body: JSON.stringify({score: this.state.score}),
            headers: {
                'content-Type': 'application/json'
            },
        }).then(function (response) {
            return response
        }).then(function (body) {
            console.log(body);
        });
    }

    usernameExists() {
        if(this.state.usernameSet) {
            return(
                <body>
                    <p>Welcome, {this.state.username}. You may now proceed to the next assessment</p>
                </body>
            )
        }

        return(
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
            </div>
        )
    }

    componentDidMount() {
        fetch('/users/get-username')
        .then(res => {
            if(res.ok) return res.json();
        }).then(data => {
            if(data.username) {
                this.setState({
                    username: data.username,
                    usernameSet: true
                })
            }
        }).catch(err => console.error(err));
    }

    render() {
        return this.usernameExists()
    }
}

export default LoginPage;