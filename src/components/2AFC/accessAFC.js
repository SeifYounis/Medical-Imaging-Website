import { Component } from "react"
import AlternateChoices from './afc'

import { io } from 'socket.io-client'

class AccessAFC extends Component {
    constructor() {
        super()

        // Set up web socket
        this.socket = io()

        this.state = {
            unlocked: false
        }
    }

    accessAssessment() {
        // Display message if instructor hasn't unlocked the test
        if (!this.state.unlocked) {
            return (
                <h2>Please wait for the instructor to unlock this test</h2>
            )
        }

        return <AlternateChoices assessment={this.props.assessment}/>
    }

    componentDidMount() {
        fetch('/users/get-username')
            .then(res => {
                if (res.ok) return res.json();
            })
            .then(data => {
                if (data.username) {
                    // Send client data to admin
                    this.socket.emit('new user', {
                        assessment: this.props.assessment,
                        joined: new Date().toLocaleString(),
                        username: data.username
                    })
                }
            })

        this.socket.on('unlock 2AFC', () => {
            this.setState({unlocked: true})
        })
    }

    render () {
        return this.accessAssessment()
    }
}

export default AccessAFC