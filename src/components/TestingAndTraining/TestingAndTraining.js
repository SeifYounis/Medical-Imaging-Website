/**
 * Code for rendering Testing and Training assessments
 */

import { Component } from 'react'

import './testing.css'
import { fadeOutAndfadeIn } from '../../assets/fadingAnimation'
import { Timer } from '../Timer/timer';
import { loadImages, loadTrainingImages } from '../../assets/loadImages';
import Results from '../results'

let presentImages, absentImages, presentAnswerImages
let timer = new Timer()

// Load images according to assessment details
function configureImages(numImages, group) {
    let images;

    if (group === null) {  // If no group, we are on the testing assessment
        images = loadImages()

        presentImages = images.presentImages.slice(0, numImages / 2)
        absentImages = images.absentImages.slice(0, numImages / 2)
        presentAnswerImages = images.presentAnswerImages.slice(0, numImages / 2)

    } else { // Otherwise, we are on training
        let numPresentImages, numAbsentImages, numPresentAnswerImages;

        images = loadTrainingImages() // These images are used exclusively in training phase

        // User's group assigment influences distribution of type of images shown
        if (group === 'A') {
            numPresentImages = Math.ceil(2 * numImages / 3)
        } else if (group === 'B') {
            numPresentImages = Math.floor(numImages / 3)
        }

        numPresentAnswerImages = numPresentImages
        numAbsentImages = numImages - numPresentImages

        presentImages = images.presentTrainingImages.slice(0, numPresentImages)
        presentAnswerImages = images.presentAnswerImages.slice(0, numPresentAnswerImages)
        absentImages = images.absentTrainingImages.slice(0, numAbsentImages)
    }
}

class TestingAndTraining extends Component {
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
            testOver: false,
            results: null,
        }
    }

    // Load new image
    newImage() {
        let random = (min, max) => {
            let num = Math.random() * (max - min) + min;

            return Math.round(num);
        };

        let condition;

        let image, solution;

        // If assessment is over, don't load new image.
        // Otherwise, randomly pick either a present or absent image as available
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

        console.log(condition)

        if (condition === 0) {
            solution = "No signal"

            let index = random(0, absentImages.length - 1);
            image = absentImages[index]

            absentImages.splice(index, 1);
        } else {
            // this.setState({
            //     solution: "Signal present"
            // })

            solution = "Signal present"

            let index = random(0, presentImages.length - 1);

            image = presentImages[index]

            let answerImage = presentAnswerImages[index]
            this.setState({
                answerImage: answerImage
            })

            presentImages.splice(index, 1);
            presentAnswerImages.splice(index, 1);
        }

        this.setState({
            promptImage: image,
            solution: solution
        })

        console.log(image)

        return image
    }

    // Function for picking next image to display and transitioning to it
    processSelection(selectedAnswer) {
        clearInterval(timer.timerInterval);

        if (this.state.totalAnswered < this.props.configInfo.numImages) {
            // Add selection data to 'results' table in database
            fetch('/add-selection', {
                method: 'POST',
                body: JSON.stringify({
                    assessment: this.props.assessment,
                    promptImage: this.state.promptImage,
                    answer: selectedAnswer,
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
            }).catch(err => {
                console.log(err)
            });

            let resultContainer;

            let image = document.getElementById("medical-scan");
            image.style.visibility = 'visible';

            let score;
            let correct;

            if (selectedAnswer === this.state.solution) {
                resultContainer = document.getElementById('correct')

                score = (this.state.correct + 1) / (this.state.totalAnswered + 1)
                correct = this.state.correct + 1

                // this.setState({
                //     score: (this.state.correct + 1) / (this.state.totalAnswered + 1),
                //     correct: this.state.correct + 1
                // })
            } else {
                resultContainer = document.getElementById('incorrect')

                score = this.state.correct / (this.state.totalAnswered + 1)
                correct = this.state.correct
            }

            // Update assessment progress
            this.setState({
                isDisabled: true,
                totalAnswered: this.state.totalAnswered + 1,
                correct: correct,
                score: score
            });

            // (Training only) Display if selection was correct/incorrect for a few seconds before 
            // moving on to next image
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

            /**
             * Check if user has answered all prompts
             * False: switch to next prompt image
             * True: end the test
             */
            if (this.state.totalAnswered + 1 < this.props.configInfo.numImages) {
                /** 
                 * In the training interface, add a delay before transitioning to the next image so users have time to view feedback. 
                 * No such delay needed for the testing interface
                 * */
                if (this.props.assessment === 'training') {
                    setTimeout(() => {
                        fadeOutAndfadeIn(image, this.newImage());
                        timer.startTimer(this);
                    }, 2000)

                    setTimeout(() => {
                        this.setState({ isDisabled: false });
                    }, 4000);

                } else if (this.props.assessment.includes('testing')) {
                    fadeOutAndfadeIn(image, this.newImage());

                    timer.startTimer(this);

                    setTimeout(() => {
                        this.setState({ isDisabled: false });
                    }, 2000)
                }


            } else {
                // End test once all questions are answered.
                setTimeout(() => {
                    this.setState({ testOver: true }, () => {
                        this.finishAssessment()
                    })
                }, 1500)
            }
        }
    }

    // Post grade to Canvas.
    // If self-study, fetch HTML code for displaying test results
    async finishAssessment() {
        await fetch('/lti/post-grade', {
            method: 'POST',
            body: JSON.stringify({ score: this.state.score }),
            headers: {
                'content-Type': 'application/json'
            },
        })

        if (!this.props.guided) {
            await fetch('/scripts/display-results', {
                method: 'POST',
                body: JSON.stringify({ assessment: this.props.assessment }),
                headers: {
                    'content-Type': 'application/json'
                },
            })
                .then(response => response.text())
                .then(rawHTML => this.setState({ results: rawHTML }))
        }
    }

    // Begin assessment once page has loaded
    componentDidMount() {
        configureImages(this.props.configInfo.numImages, this.props.group)

        // Display score only if on the training assessment
        let scoreboard = document.getElementById('scoreboard')
        scoreboard.style.visibility = this.props.assessment === "training" ? "visible" : "hidden"

        document.getElementById('medical-scan').src = this.newImage()

        console.log(document.getElementById('medical-scan').src)

        timer.startTimer(this);
    }

    render() {
        // Display completion message once assessment is over. If self-study, display user results
        if (this.state.testOver) {
            if (!this.props.guided) {

                // If results are ready to be displayed, render HTML page. Otherwise, display loading
                // animation until results are retrieved
                if (this.state.results) {
                    return Results(this.state.results)
                }
                
                return (
                    <div id="loader-wrapper">
                        <div id="loader"></div>
                    </div>
                )
            }

            return (
                <p>You have completed the <b>{this.props.assessment}</b> assessment. You may now close this tab</p>
            )
        }

        return (
            <div>
                <div id="testing-container">
                    <div className="split left">
                        <div className="centered">
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

                    <div className="split right" id="split-right">
                        <div className="top-right">
                            <h1 className="prompt-testing">Click on the image if you believe it contains a signal. Otherwise, click 'No'</h1>
                        </div>

                        <div className="center-right">
                            <button className="no-button" id="no-button"
                                disabled={this.state.isDisabled}
                                onClick={() => {
                                    this.processSelection("No signal");
                                }}>No
                            </button>

                            <Timer configInfo={this.props.configInfo} />
                        </div>

                        <div className="bottom-right" id='scoreboard'>
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
            </div>
        )
    }
}

export default TestingAndTraining;