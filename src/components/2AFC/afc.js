import React, { Component } from 'react'

import './afc.css'
import { fadeOutAndfadeIn } from '../../assets/fadingAnimation'
import { loadImages } from '../../assets/loadImages';
// import {
//     presentImages,
//     absentImages
// } from '../../assets/loadImages'

let {presentImages, absentImages} = loadImages()

// Signal absent image in prompt_image and signal present image in solution
// Image selected will go into answer

function configureImages(numImages) {
    presentImages = presentImages.slice(0, numImages)
    absentImages = absentImages.slice(0, numImages)
}

class AlternativeForcedChoice extends Component {
    constructor() {
        super();

        this.state = {
            leftImage: null,
            rightImage: null,
            promptImage: null,
            solution: null,
            correct: 0,
            score: 0,
            totalAnswered: 0,
            clickDisabled: false,
            keyDisabled: false,
            testOver: false,
        }
    }

    // HOST = window.location.origin.replace(/^http/, 'ws')
    // ws = new WebSocket(this.HOST);

    // Load next pair of medical scans
    newPair() {
        if (absentImages.length && presentImages.length) {
            let random = (min, max) => {
                let num = Math.random() * (max - min) + min;

                return Math.round(num);
            };

            // Get one image from the target absent images collection
            let absentIndex = random(0, absentImages.length - 1);
            let absentImage = absentImages[absentIndex].default;
            absentImages.splice(absentIndex, 1);

            // Get another image from the target present images collection
            let presentIndex = random(0, presentImages.length - 1);
            let presentImage = presentImages[presentIndex].default
            presentImages.splice(presentIndex, 1);

            var leftImage;
            var rightImage;

            // Represents which side contains the correct image
            var side;

            side = random(0, 1);

            // Put correct image on left and set left button as correct answer
            if (side === 0) {
                leftImage = presentImage
                rightImage = absentImage
            } else {
                leftImage = absentImage
                rightImage = presentImage
            }

            this.setState({
                leftImage: leftImage,
                rightImage: rightImage,
                promptImage: absentImage,
                solution: presentImage,
            })

            return [leftImage, rightImage]
        }

        return []
    }

    processSelection(selectedSide) {
        if (this.state.totalAnswered < this.props.configInfo.numImages) {
            this.setState({
                clickDisabled: true,
                keyDisabled: true,
                totalAnswered: this.state.totalAnswered + 1,
            });

            if (selectedSide === this.state.solution) {
                this.setState({
                    score: (this.state.correct + 1) / (this.state.totalAnswered + 1),
                    correct: this.state.correct + 1
                })
            } else {
                this.setState({
                    score: this.state.correct / (this.state.totalAnswered + 1),
                })
            }

            // console.log("Prompt image is " + this.state.promptImage)
            // console.log("Solution is " + this.state.solution)
            // console.log("Answer is " + selectedSide)

            fetch('/add-selection', {
                method: 'POST',
                body: JSON.stringify({
                    assessment: this.props.assessment,
                    promptImage: this.state.promptImage,
                    answer: selectedSide,
                    answerDate: new Date().toLocaleString(),
                    solution: this.state.solution,
                    guided: this.props.guided
                }),
                headers: {
                    'content-Type': 'application/json'
                },
            }).then(function (response) {
                return response
            }).then(function (body) {
                console.log(body);
            });

            let nextPair = this.newPair();

            // Update user entry in 'active_connections' table in database 
            // const wsData = JSON.stringify({
            //     current_test: this.props.assessment,
            //     last_answered: date
            // })
            // this.ws.send(wsData)

            if (nextPair.length) {
                let currentLeft = document.getElementById("scan-left");
                let currentRight = document.getElementById("scan-right");

                fadeOutAndfadeIn(currentLeft, nextPair[0])
                fadeOutAndfadeIn(currentRight, nextPair[1])

                setTimeout(() => {
                    this.setState({
                        clickDisabled: false,
                        keyDisabled: false
                    });
                }, 2000);
            } else {
                setTimeout(() => {
                    this.setState({ testOver: true })
                }, 2500)
            }
        }
    }

    componentDidMount() {
        configureImages(this.props.configInfo.numImages)

        var firstPair = this.newPair()

        // Set first left and right images
        document.getElementById("scan-left").src = firstPair[0]
        document.getElementById("scan-right").src = firstPair[1]

        // Add event listener so certain keystrokes are linked to responses
        document.addEventListener('keydown', (event) => {
            if (!this.state.keyDisabled) {
                if (event.key === "f") {
                    let currentLeft = this.state.leftImage;
                    this.processSelection(currentLeft)
                }

                else if (event.key === "j") {
                    let currentRight = this.state.rightImage;
                    this.processSelection(currentRight)
                }
            }
        });
    }

    render() {
        // Display message once test is over
        if (this.state.testOver) {
            fetch('/lti/post-grade', {
                method: 'POST',
                body: JSON.stringify({ score: this.state.score }),
                headers: {
                    'content-Type': 'application/json'
                },
            })

            return (
                <p>You have completed the <b>{this.props.assessment}</b> assessment. You may now close this tab</p>
            )
        }

        return (
            <div>
                <div className="header" id="afc-prompt">
                    <h1 className="afc-prompt part-1">
                        One of these images contains a signal.
                        Click on the image you believe contains a signal.
                    </h1>

                    <h1 className="afc-prompt part-2">
                        You can also press 'F' to select the left image or 'J' to select the right image
                    </h1>
                </div>

                <div className="split left" id="split-afc">
                    <div className="centered">
                        <button
                            className="image-button"
                            id="image-button"
                            disabled={this.state.clickDisabled}
                            onClick={() => {
                                let currentLeft = this.state.leftImage;
                                this.processSelection(currentLeft)
                            }}>
                            <img alt="Left scan" id="scan-left" />
                        </button>
                    </div>
                </div>

                <div className="split right" id="split-afc">
                    <div className="centered">
                        <button
                            className="image-button"
                            id="image-button"
                            disabled={this.state.clickDisabled}
                            onClick={() => {
                                let currentRight = this.state.rightImage;
                                this.processSelection(currentRight)
                            }}>
                            <img alt="Right scan" id="scan-right" />
                        </button>
                    </div>
                </div>
            </div>
        )
    }
}

export default AlternativeForcedChoice;