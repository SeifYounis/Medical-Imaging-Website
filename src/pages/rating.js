import React, { Component } from 'react'
import Slider from 'react-rangeslider'
import 'react-rangeslider/lib/index.css';
import '../styles/rating.css'
import { fadeOutAndfadeIn } from '../assets/fadingAnimation'
import {
    presentImages,
    absentImages
} from '../assets/loadImages'
import { Timer } from '../assets/timer';

var timer = new Timer();

// Every selection contains the following information

// Name of user, session id
// Timestamp for when an answer is selected
// Rating user gave
// Name of the image with unique identifier
// Type of image

class Rating extends Component {
    constructor() {
        super();

        this.state = {
            isDisabled: false,
            selectedValue: 0,
            ratings: []
            // correct: 0,
            // totalAnswered: 0,
            // score: 0,
            // correctSide: null,
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

    // processSelection(selectedSide) {
    //     this.setState({
    //         clickDisabled: true,
    //         keyDisabled: true,
    //         totalAnswered: this.state.totalAnswered + 1,
    //     });

    //     if (selectedSide === this.state.correctSide) {
    //         this.setState({
    //             score: (this.state.correct + 1)/(this.state.totalAnswered + 1),
    //             correct: this.state.correct + 1
    //         })
    //     } else {
    //        this.setState({
    //             score: this.state.correct/(this.state.totalAnswered + 1),
    //         })
    //     }

    //     let nextPair = this.newPair()
    //     if (nextPair.length) {
    //         let currentLeft = document.getElementById("scan-left");
    //         let currentRight = document.getElementById("scan-right");

    //         fadeOutAndfadeIn(currentLeft, nextPair[0])
    //         fadeOutAndfadeIn(currentRight, nextPair[1])

    //         setTimeout(() => {
    //             this.setState({
    //                 clickDisabled: false,
    //                 keyDisabled: false
    //             });
    //         }, 2000);
    //     }
    // }


    handleOnChange = (value) => {
        this.setState({
            selectedValue: value
        }) 
    }

    componentDidMount() {
        document.getElementById('medical-scan').src = this.newImage()

        timer.startTimer(this);
    }

    render() {
        return (
            <body>
                <div class="header" id="rating-prompt">
                    <h1 class="rating-prompt part-1">
                        Indicate your confidence in the existence of a signal in the following image
                    </h1>
        
                    <h1 class="rating-prompt part-2">
                        Negative values indicate signal likely does not exist, positive values indicate signal likely does exist
                    </h1>
                </div>
    
                <div class="split left" id="split-rating">
                    <div class="centered">
                        <img alt="Medical scan" id="medical-scan"/>
                    </div>
                </div>
    
                <div class="split right" id="split-rating">
                    <div class="center-right">
                        <Timer/>

                        <Slider
                            min={-10}
                            max={10}
                            step={1}
                            value={this.state.selectedValue}
                            onChange={this.handleOnChange}
                            keepTooltip={true}
                            // getAriaValueText={this.state.selectedValue}
                            tooltip={true}
                            // marks={marks}
                            // valueLabelDisplay={"on"}
                            
                        >
                        </Slider>

                        <div class="sliderticks">
                            <p>-10</p>
                            <p>-8</p>
                            <p>-6</p>
                            <p>-4</p>
                            <p>-2</p>
                            <p>0</p>
                            <p>2</p>
                            <p>4</p>
                            <p>6</p>
                            <p>8</p>
                            <p>10</p>
                        </div>

                        {/* <button>Confirm rating</button>
                        <div>{this.state.selectedValue}</div> */}
                        
                    </div>
                </div>
            </body>
        )
    }
}

export default Rating;