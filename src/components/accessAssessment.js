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
            configInfo: null,
            group: null
        }
    }

    accessAssessment() {
        // Display message if instructor hasn't unlocked the test
        if (!this.state.unlocked) {
            return (
                <h2>Please wait for the instructor to unlock the <b>{this.props.assessment}</b> assessment</h2>
            )
        } else {
            if (this.props.assessment.includes("testing") || this.props.assessment === 'training') {
                return <TestingAndTraining
                    configInfo={this.state.configInfo}
                    assessment={this.props.assessment}
                    group={this.state.group} />

            } else if (this.props.assessment === 'rating') {
                return <Rating
                    configInfo={this.state.configInfo}
                    assessment={this.props.assessment} />
            } else if (this.props.assessment === '2AFC') {
                return <AlternateChoices
                    configInfo={this.state.configInfo}
                    assessment={this.props.assessment} />
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

        this.socket.on('unlock training', (configInfo, group) => {
            this.setState({
                unlocked: true,
                configInfo: configInfo,
                group: group
            })
        })

        this.socket.on('unlock testing', (configInfo) => {
            this.setState({
                unlocked: true,
                configInfo: configInfo
            })
        })

        this.socket.on('unlock rating', (configInfo) => {
            this.setState({
                unlocked: true,
                configInfo: configInfo
            })
        })

        this.socket.on('unlock 2AFC', (configInfo) => {
            this.setState({
                unlocked: true,
                configInfo: configInfo
            })
        })
    }

    render() {
        return this.accessAssessment()
    }
}

export default AccessAssessment