import { Component } from "react";

import TestingAndTraining from "./TestingAndTraining/TestingAndTraining";
import Rating from "./Rating/rating";
import AlternativeForcedChoice from "./2AFC/afc";

import { io } from 'socket.io-client'

class AccessAssessment extends Component {
    constructor(props) {
        super(props)

        // Set up web socket
        this.socket = props.guided === true ? io() : null

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
            console.log(this.props.guided)

            if (this.props.assessment.includes("testing") || this.props.assessment === 'training') {
                return <TestingAndTraining
                    configInfo={this.state.configInfo}
                    assessment={this.props.assessment}
                    group={this.state.group} 
                    guided={this.props.guided}/>

            } else if (this.props.assessment === 'rating') {
                return <Rating
                    configInfo={this.state.configInfo}
                    assessment={this.props.assessment} 
                    guided={this.props.guided} />
            } else if (this.props.assessment === '2AFC') {
                return <AlternativeForcedChoice
                    configInfo={this.state.configInfo}
                    assessment={this.props.assessment} 
                    guided={this.props.guided} />
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
                    this.socket?.emit('new user', {
                        assessment: this.props.assessment,
                        joined: new Date().toLocaleString(),
                        username: data.username
                    })
                }
            })
            .catch(err => {
                console.log("Unable to retrieve username")
            })
        
        // Receive configuration info from admin if doing guided assessment
        this.socket?.on(`unlock ${this.props.assessment}`, (configInfo, group=null) => {
            this.setState({
                unlocked: true,
                configInfo: configInfo,
                group: group
            })
        })

        // Otherwise, configure assessment for self-study
        if (!this.props.guided) {
            this.setState({
                unlocked: true,
                configInfo: {
                    timeLimit: 10,
                    secondsVisible: 7,
                    numImages: 60
                },
                group: (Math.floor(Math.random() * 2) + 1) === 1 ? 'A' : 'B'
            })
        }
    }

    render() {
        return this.accessAssessment()
    }
}

export default AccessAssessment