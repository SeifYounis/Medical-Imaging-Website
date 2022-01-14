import { Component } from 'react'
import { io } from "socket.io-client";

import '../styles/testing.css'
import { fadeOutAndfadeIn } from '../assets/fadingAnimation'
import {
    presentImages,
    absentImages,
    presentAnswerImages
} from '../assets/loadImages'
import { Timer } from '../assets/timer'

var timer = new Timer();

// Every selection contains the following information

// Name of user, user id
// Timestamp for when an answer is selected
// Answer user gave
// Name of the image with unique identifier
// Type of image

class Testing extends Component {
    constructor() {
        super();

        this.state = {
            promptImage: null,
            solution: null,
            answerImage: null,
            isDisabled: false,
            correct: 0,
            totalAnswered: 0,
            score: 0,
            testOver: false
        }
    }

    // Set up web socket
    socket = io()

    // HOST = window.location.origin.replace(/^http/, 'ws')
    // ws = new WebSocket(this.HOST);

    // Load new image
    newImage() {
        let random = (min, max) => {
            let num = Math.random() * (max - min) + min;

            return Math.round(num);
        };

        var condition;
        var image;

        if (!absentImages.length && !presentImages.length) {
            clearInterval(timer.timerInterval);
            return document.getElementById("medical-scan").src;
        } else if (!presentImages.length) {
            condition = 0;
        } else if (!absentImages.length) {
            condition = 1;
        } else {
            condition = random(0, 1);
        }

        if (condition === 0) {
            this.setState({
                solution: "No signal"
            })

            let index = random(0, absentImages.length - 1);
            image = absentImages[index].default

            absentImages.splice(index, 1);
        } else {
            this.setState({
                solution: "Signal present"
            })

            // console.log("Signal Present Images Length: " + presentImages.length)

            let index = random(0, presentImages.length - 1);
            image = presentImages[index].default

            let answerImage = presentAnswerImages[index].default
            this.setState({
                answerImage: answerImage
            })

            presentImages.splice(index, 1);
            presentAnswerImages.splice(index, 1);
        }

        this.setState({
            promptImage: image
        })

        return image
    }

    // Function for picking next image to display and transitioning to it
    processSelection(selectedAnswer) {
        clearInterval(timer.timerInterval);

        if (this.state.totalAnswered < 20) {
            let date = new Date().toLocaleString()

            // Add selection data to 'results' table in database
            fetch('/add-selection', {
                method: 'POST',
                body: JSON.stringify({
                    assessment: this.props.assessment,
                    promptImage: this.state.promptImage,
                    answer: selectedAnswer,
                    answerDate: date,
                    solution: this.state.solution
                }),
                headers: {
                    'content-Type': 'application/json'
                },
            }).then(function (response) {
                return response
            }).then(function (body) {
                console.log(body);
            }).catch(err => {
                console.log(err)
            });

            // Update user entry in 'active_connections' table in database 
            // const wsData = JSON.stringify({
            //     current_test: this.props.assessment,
            //     last_answered: date
            // })
            // this.ws.send(wsData)

            var resultContainer;

            let image = document.getElementById("medical-scan");
            image.style.visibility = 'visible';

            if (selectedAnswer === this.state.solution) {
                resultContainer = document.getElementById('correct')

                this.setState({
                    score: (this.state.correct + 1) / (this.state.totalAnswered + 1),
                    correct: this.state.correct + 1
                })
            } else {
                resultContainer = document.getElementById('incorrect')

                this.setState({
                    score: this.state.correct / (this.state.totalAnswered + 1),
                })
            }

            this.setState({
                isDisabled: true,
                totalAnswered: this.state.totalAnswered + 1,
            });


            if (this.props.assessment === "training") {
                resultContainer.style.display = "block";
                document.getElementById('split-right').style.display = "none";

                if (this.state.solution === "Signal present") {
                    document.getElementById('medical-scan').src = this.state.answerImage
                }

                setTimeout(() => {
                    document.getElementById('split-right').style.display = "block";
                    resultContainer.style.display = "none";
                }, 2000)
            }

            if (this.state.totalAnswered + 1 < 20) {
                setTimeout(() => {
                    fadeOutAndfadeIn(image, this.newImage());
                }, 2000)

                setTimeout(() => {
                    this.setState({
                        isDisabled: false
                    });
                }, 3750);

                setTimeout(() => {
                    timer.startTimer(this);
                }, 2000);
            } else {
                setTimeout(() => {
                    this.setState({ testOver: true })
                }, 2500)
            }
        }
    }

    componentDidMount() {
        fetch('/users/get-username')
            .then(res => {
                if (res.ok) return res.json();
            }).then(data => {
                if (data.username) {
                    console.log(data.username)
                }
            }).catch(err => console.error(err));

        document.getElementById('medical-scan').src = this.newImage()

        timer.startTimer(this);
    }

    render() {
        if (this.state.testOver) {
            fetch('/lti/post-grade', {
                method: 'POST',
                body: JSON.stringify({ score: this.state.score }),
                headers: {
                    'content-Type': 'application/json'
                },
            })

            return (
                <p>You have completed the <b>{this.props.assessment}</b> assessment. Your grade has been successfully posted.</p>
            )
        }

        return (
            <body>
                <div id="testing-container">
                    <div class="split left">
                        <div class="centered">
                            <button
                                id="scan-button"
                                disabled={this.state.isDisabled}
                                onClick={() => {
                                    this.processSelection("Signal present");
                                }}>
                                <img alt="medical-scan" id="medical-scan" />
                            </button>
                        </div>
                    </div>

                    <div class="split right" id="split-right">
                        <div class="top-right">
                            <h1 class="prompt-testing">Click on the image if you believe it contains a signal. Otherwise, click 'No'</h1>
                        </div>

                        <div class="center-right">
                            <button class="no-button" id="no-button"
                                disabled={this.state.isDisabled}
                                onClick={() => {
                                    this.processSelection("No signal");
                                }}>No
                            </button>

                            <Timer />
                        </div>

                        <div class="bottom-right">
                            <h2 id="score">
                                Score: {this.state.correct}/{this.state.totalAnswered}
                            </h2>
                        </div>
                    </div>
                </div>

                <div id="feedback-container">
                    <div id="correct">
                        CORRECT
                    </div>

                    <div id="incorrect">
                        INCORRECT
                    </div>
                </div>
            </body>
        )
    }
}

export default Testing;