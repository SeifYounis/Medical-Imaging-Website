import { Component } from "react";
import Rating from './rating'

import { io } from 'socket.io-client'

class AccessRating extends Component {
    constructor() {
        super();

        // Set up web socket
        this.socket = io()

        this.state = {
            unlocked: false,
            timerInfo: null
        }
    }

    accessAssessmemt() {
        if (this.state.unlocked) {
            return <Rating timerInfo={this.state.timerInfo} assessment={this.props.assessment}/>
        }

        return <h2>Please wait for the instructor to unlock this test</h2>
    }

    componentDidMount() {
        fetch('/users/get-username')
            .then(res => {
                if (res.ok) return res.json();
            })
            .then(data => {
                if (data.username) {
                    this.socket.emit('new user', {
                        assessment: this.props.assessment,
                        joined: new Date().toLocaleString(),
                        username: data.username
                    })
                }
            })

        this.socket.on('unlock rating', (timerInfo) => {
            this.setState({
                unlocked: true,
                timerInfo: timerInfo
            })
        })
    }

    render() {
        return this.accessAssessmemt()
    }
}

export default AccessRating
