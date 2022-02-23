import { Component } from "react";

import TestingAndTraining from "./TestingAndTraining/TestingAndTraining";
import Rating from "./Rating/rating";
import AlternateChoices from "./2AFC/afc";

import { io } from 'socket.io-client'

class AccessAssessment extends Component {
    constructor() {
        super()

        // Set up web socket
        this.socket = io()

        this.state = {
            unlocked: false,
            timerInfo: null
        }
    }

    accessAssessment() {
        // Display message if instructor hasn't unlocked the test
        if (!this.state.unlocked) {
            return (
                <h2>Please wait for the instructor to unlock this test</h2>
            )
        } else {
            if(this.props.assessment === "testing" || this.props.assessment === 'training') {
                return <TestingAndTraining timerInfo={this.state.timerInfo} assessment={this.props.assessment}/>
            } else if(this.props.assessment === 'rating') {
                return <Rating timerInfo={this.state.timerInfo} assessment={this.props.assessment}/>
            } else if(this.props.assessment === '2AFC') {
                return <AlternateChoices assessment={this.props.assessment}/>
            }
        }
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

        // this.socket.on(`unlock ${this.props.assessment}`, (timerInfo) => {
        //     this.setState({
        //         unlocked: true,
        //         timerInfo: timerInfo
        //     })
        // })

        this.socket.on('unlock training', (timerInfo) => {
            this.setState({
                unlocked: true,
                timerInfo: timerInfo
            })
        })

        this.socket.on('unlock testing', (timerInfo) => {
            this.setState({
                unlocked: true,
                timerInfo: timerInfo
            })
        })

        this.socket.on('unlock rating', (timerInfo) => {
            this.setState({
                unlocked: true,
                timerInfo: timerInfo
            })
        })

        this.socket.on('unlock 2AFC', () => {
            this.setState({unlocked: true})
        })
    }

    render() {
        return this.accessAssessment()
    }
}

export default AccessAssessment