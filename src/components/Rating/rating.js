/**
 * Code for rendering Rating assessment.
 * 
 * NOTE: An important distinction
 * Rating at 0 and question timed out: no activity
 * Rating at 0 and confirmed: intentional answer
 */

import { Component } from 'react'

import './rating.css'
import { fadeOutAndfadeIn } from '../../assets/fadingAnimation'
import { Timer } from '../Timer/timer';
import { loadImages } from '../../assets/loadImages';
import Results from '../results';

import Slider from 'rc-slider';
import 'rc-slider/assets/index.css';

let timer = new Timer();
let {presentImages, absentImages} = loadImages()


function configureImages(numImages) {
    presentImages = presentImages.slice(0, numImages/2)
    absentImages = absentImages.slice(0, numImages/2)
}

class Rating extends Component {
    constructor() {
        super();

        this.state = {
            buttonDisabled: true,
            selectedValue: null,
            totalAnswered: 0,
            promptImage: null,
            solution: null,
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
        let image
        let solution

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

            presentImages.splice(index, 1);
        }

        this.setState({
            promptImage: image,
            solution: solution
        })

        return image
    }

    // Process user response
    processSelection(selectedValue) {
        clearInterval(timer.timerInterval);

        if (this.state.totalAnswered < this.props.configInfo.numImages) {
            // Update assessment progress
            this.setState({
                buttonDisabled: true,
                totalAnswered: this.state.totalAnswered + 1,
                selectedValue: null
            });

            let image = document.getElementById("medical-scan");
            image.style.visibility = 'visible';

            let date = new Date().toLocaleString();

            // Add selection to database
            fetch('/add-selection', {
                method: 'POST',
                body: JSON.stringify({
                    assessment: this.props.assessment,
                    promptImage: this.state.promptImage,
                    answer: selectedValue,
                    answerDate: date,
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

            if (this.state.totalAnswered + 1 < this.props.configInfo.numImages) {
                fadeOutAndfadeIn(image, this.newImage());

                timer.startTimer(this)
            } else {
                // End test once all questions are answered. Post grade to Canvas.
                // If self-study, fetch HTML code for displaying test results
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

    // Handle rating value change.
    handleOnChange = (value) => {
        let image = document.getElementById('medical-scan')

        // Don't let user click submit button unless the image is fully loaded
        let disableButton = image.style.opacity === '1' ? false : true

        this.setState({
            selectedValue: value,
            buttonDisabled: disableButton
        })
    }

    // Begin assessment once page has loaded
    componentDidMount() {
        configureImages(this.props.configInfo.numImages)

        let image = document.getElementById('medical-scan')
        image.src = this.newImage()
        image.style.opacity = 1

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
            <body>
                <div className="header" id="rating-prompt">
                    <h1 className="rating-prompt part-1">
                        Indicate your confidence in the existence of a signal in the following image
                    </h1>

                    <h1 className="rating-prompt part-2">
                        Negative values indicate signal likely does not exist, positive values indicate signal likely does exist
                    </h1>
                </div>

                <div className="split left" id="split-rating">
                    <div className="centered">
                        <img alt="Medical scan" id="medical-scan" />
                    </div>
                </div>

                <div className="split right" id="split-rating">
                    <div className="center-right">
                        <Slider
                            className='slider'
                            trackStyle={{ backgroundColor: 'yellow', height: 10 }}
                            style={{
                                marginTop: "10vh",
                                marginLeft: "3vw",
                                marginBottom: "10vh",
                                // transform: 'translate(-50%, -50%)',
                                width: "44vw",
                                fontFamily: "cursive",
                                height: "10vh",
                                // border: "solid 5px #000",
                                // backgroundColor: "white",
                            }}
                            handleStyle={{
                                borderColor: 'white',
                                height: 20,
                                width: 20,
                                // marginLeft: -14,
                                // marginBottom: 10,
                                backgroundColor: 'black',
                            }}
                            railStyle={{ backgroundColor: 'red', height: 10 }}
                            min={-10}
                            max={10}
                            step={1}
                            value={this.state.selectedValue}
                            onChange={this.handleOnChange}
                            marks={{
                                "-10": {
                                    style: { fontSize: "1.3em", color: "black" },
                                    label: <div>-10<br /> <br /><strong style={{ color: "red", marginLeft: '3vw' }}>No signal</strong></div>
                                },
                                "-8": {
                                    style: { fontSize: "1.3em", color: "black" },
                                    label: -8
                                },
                                "-6": {
                                    style: { fontSize: "1.3em", color: "black" },
                                    label: -6
                                },
                                "-4": {
                                    style: { fontSize: "1.3em", color: "black" },
                                    label: -4
                                },
                                "-2": {
                                    style: { fontSize: "1.3em", color: "black" },
                                    label: -2
                                },
                                0: {
                                    style: { fontSize: "1.3em", color: "black" },
                                    label: 0
                                },
                                2: {
                                    style: { fontSize: "1.3em", color: "black" },
                                    label: 2
                                },
                                4: {
                                    style: { fontSize: "1.3em", color: "black" },
                                    label: 4
                                },
                                6: {
                                    style: { fontSize: "1.3em", color: "black" },
                                    label: 6
                                },

                                8: {
                                    style: { fontSize: "1.3em", color: "black" },
                                    label: 8
                                },

                                10: {
                                    style: { fontSize: "1.3em", color: "black" },
                                    label: <div>10<br /> <br /><strong style={{ color: "blue" }}>Signal exists</strong></div>
                                }
                            }}
                        />

                        <button
                            id='submit-rating'
                            style={{ marginLeft: "20vw" }}
                            disabled={this.state.buttonDisabled}
                            onClick={() => {
                                this.processSelection(this.state.selectedValue);
                            }}>Confirm rating: {this.state.selectedValue}</button>

                    </div>

                    <Timer configInfo={this.props.configInfo || {timeLimit: 10, secondsVisible: 7}}/>
                </div>
            </body>
        )
    }
}

export default Rating;