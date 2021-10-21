import { Component } from 'react'
import '../styles/testing.css'
import { fadeOutAndfadeIn } from '../assets/fadingAnimation'
import {
    presentImages,
    absentImages
} from '../assets/loadImages'
import { Timer } from '../assets/timer'

var timer = new Timer();

class Testing extends Component {
    constructor() {
        super();

        this.state = {
            isDisabled: false,
            correct: 0,
            totalAnswered: 0,
            score: 0,
            correctAnswer: null,
        }
    }

    // Load new image
    newImage() {
        let random = (min, max) => {
            let num = Math.random() * (max - min) + min;
    
            return Math.round(num);
        };

        var condition;

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
                correctAnswer: "No"
            })

            console.log("Absent Images Length: " + absentImages.length)

            let index = random(0, absentImages.length - 1);
            let image = absentImages[index].default

            absentImages.splice(index, 1);

            return image
        } else {
            this.setState({
                correctAnswer: "Yes"
            })

            console.log("Present Images Length: " + presentImages.length)

            let index = random(0, presentImages.length - 1);
            let image = presentImages[index].default

            presentImages.splice(index, 1);

            return image
        }
    }

    // Function for picking next image to display and transitioning to it
    processSelection(selectedAnswer) {
        // debugger;
        var resultContainer;

        clearInterval(timer.timerInterval);

        if (this.state.totalAnswered === 20) {
        } else {
            if (selectedAnswer === this.state.correctAnswer) {
                resultContainer = document.getElementById('correct')

                this.setState({
                    score: (this.state.correct + 1)/(this.state.totalAnswered + 1),
                    correct: this.state.correct + 1
                })
            } else {
                resultContainer = document.getElementById('incorrect')

                this.setState({
                    score: this.state.correct/(this.state.totalAnswered + 1),
                })
            }

            this.setState({
                isDisabled: true,
                totalAnswered: this.state.totalAnswered + 1,
            });

            if (this.props.type === "training") {
                resultContainer.style.display = "block";
                document.getElementById('testing-container').style.display = "none";

                setTimeout(() => {
                    document.getElementById('testing-container').style.display = "block";
                    resultContainer.style.display = "none";
                }, 2000)
            }

            let image = document.getElementById("medical-scan");
            setTimeout(() => {
                fadeOutAndfadeIn(image, this.newImage());
            }, 2000)
    
            setTimeout(
                function () {
                    this.setState({
                        isDisabled: false
                    });
                }.bind(this),
                3750
            );

            setTimeout(() => {
                timer.startTimer(this);
            }, 2000)
        }
    }

    componentDidMount() {
        document.getElementById('medical-scan').src = this.newImage()

        timer.startTimer(this);
    }

    render() {
        return (
            <body>
                <div id="testing-container">
                    <div class="split left">
                        <div class="centered">
                            <button
                                id="image-button"
                                disabled={this.state.isDisabled}
                                onClick={() => this.processSelection("Yes")}>
                                <img alt="medical-scan" id="medical-scan"/>
                            </button>
                        </div>
                    </div>

                    <div class="split right">
                        <div class="top-right">
                            <h1 class="prompt-testing">Click on the image if you believe it contains a signal. Otherwise, click 'No'</h1>
                        </div>

                        <div class="center-right">
                            <button class="no-button" id="no-button"
                                disabled={this.state.isDisabled}
                                onClick={() => this.processSelection("No")}
                            >No</button>

                            <Timer/>
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