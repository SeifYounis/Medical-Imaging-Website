import { Component } from "react";

import TestingAndTraining from "./TestingAndTraining/TestingAndTraining";
import Rating from "./Rating/rating";
import AlternativeForcedChoice from "./2AFC/afc";

import { io } from 'socket.io-client'

/**
 * This component acts as a middleman between requests sent to access a certain assessment and the 
 * assessment itself.
 */
class AccessAssessment extends Component {
    constructor(props) {
        super(props)

        this.state = {
            isDuplicate: false,
            unlocked: false,
            configInfo: null,
            group: null
        }

        // Set up web socket
        this.socket = props.guided === true ? io() : null

        // Set up broadcast channel to detect duplicate tabs
        const bc = new BroadcastChannel("reader study");
        let numTabs = 0
        bc.onmessage = (event) => {
            if (event.data === `first`) {
                bc.postMessage(`duplicate${numTabs}`);
                // console.log("Another tab of this site just got opened")
            }
            if (event.data === `duplicate${numTabs}`) {
                this.setState({
                    isDuplicate: true
                })
                numTabs += 1
            }
        };
        bc.postMessage(`first`);
    }

    accessAssessment() {
        // Display message if user has already opened reader study app in previous tab
        if (this.state.isDuplicate) {
            return (
                <h2>An instance of the reader study assessment is already running. Please close this tab.</h2>
            )
        }
        console.log(this.props.assessment)
        console.log(this.state.unlocked)

        // Display message if instructor hasn't unlocked the test. Guided only
        if (!this.state.unlocked) {
            return (
                <h2>Please wait for the instructor to unlock the <b>{this.props.assessment}</b> assessment</h2>
            )
        } else { // Otherwise, render assessment corresponding to name of assessment passed in
            if (this.props.assessment.includes("testing") || this.props.assessment === 'training') {
                return <TestingAndTraining
                    configInfo={this.state.configInfo}
                    assessment={this.props.assessment}
                    group={this.state.group}
                    guided={this.props.guided} />

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
        // Get username
        fetch('/users/get-username')
            .then(res => {
                if (res.ok) return res.json();
            })
            .then(data => {
                // Guided only. Add user to list of active connections on instructor's control page.
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
        this.socket?.on(`unlock ${this.props.assessment}`, (configInfo, group = null) => {
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
                    numImages: 10
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