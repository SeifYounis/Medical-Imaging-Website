import React, { Component } from 'react'
// import Slider from 'react-rangeslider'
// import 'react-rangeslider/lib/index.css';
import Slider from 'rc-slider';
import 'rc-slider/assets/index.css';
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
            totalAnswered: 0,
            // ratings: []
            // correct: 0,
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
            // this.setState({
            //     correctAnswer: "No"
            // })

            console.log("Absent Images Length: " + absentImages.length)

            let index = random(0, absentImages.length - 1);
            let image = absentImages[index].default

            absentImages.splice(index, 1);

            return image
        } else {
            // this.setState({
            //     correctAnswer: "Yes"
            // })

            console.log("Present Images Length: " + presentImages.length)

            let index = random(0, presentImages.length - 1);
            let image = presentImages[index].default

            presentImages.splice(index, 1);

            return image
        }
    }

    processSelection() {
        let image = document.getElementById("medical-scan");

        fadeOutAndfadeIn(image, this.newImage())

        this.setState({
            isDisabled: true,
            totalAnswered: this.state.totalAnswered + 1,
        });

        // if (selectedSide === this.state.correctSide) {
        //     this.setState({
        //         score: (this.state.correct + 1)/(this.state.totalAnswered + 1),
        //         correct: this.state.correct + 1
        //     })
        // } else {
        //    this.setState({
        //         score: this.state.correct/(this.state.totalAnswered + 1),
        //     })
        // }

        // let nextPair = this.newPair()
        // if (nextPair.length) {
        //     let currentLeft = document.getElementById("scan-left");
        //     let currentRight = document.getElementById("scan-right");

        //     fadeOutAndfadeIn(currentLeft, nextPair[0])
        //     fadeOutAndfadeIn(currentRight, nextPair[1])

        setTimeout(() => {
            this.setState({
                isDisabled: false
            });
        }, 2000);
    }


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
                            style={{
                                marginTop:"10vh", 
                                marginLeft: "5vw", 
                                marginBottom: "10vh", 
                                width:"40vw",
                                fontFamily: "cursive",
                            }}
                            min={-10}
                            max={10}
                            step={1}
                            disabled={this.state.isDisabled}
                            value={this.state.selectedValue}
                            onChange={this.handleOnChange}
                            marks={{
                                "-10":{
                                    style: {fontSize: "1.3em", color: "black"},
                                    label: <div>10<br></br><strong style={{color: "red"}}>No signal</strong></div>
                                },
                                "-9":{
                                    style: {fontSize: "1.3em", color: "black"},
                                    label: -9
                                },
                                "-8":{
                                    style: {fontSize: "1.3em", color: "black"},
                                    label: -8
                                },
                                "-7":{
                                    style: {fontSize: "1.3em", color: "black"},
                                    label: -7
                                },
                                "-6":{
                                    style: {fontSize: "1.3em", color: "black"},
                                    label: -6
                                },
                                "-5":{
                                    style: {fontSize: "1.3em", color: "black"},
                                    label: -5
                                },
                                "-4":{
                                    style: {fontSize: "1.3em", color: "black"},
                                    label: -4
                                },
                                "-3":{
                                    style: {fontSize: "1.3em", color: "black"},
                                    label: -3
                                },
                                "-2":{
                                    style: {fontSize: "1.3em", color: "black"},
                                    label: -2
                                },
                                "-1":{
                                    style: {fontSize: "1.3em", color: "black"},
                                    label: -1
                                },
                                0:{
                                    style: {fontSize: "1.3em", color: "black"},
                                    label: 0
                                },
                                1:{
                                    style: {fontSize: "1.3em", color: "black"},
                                    label: 1
                                },
                                2:{
                                    style: {fontSize: "1.3em", color: "black"},
                                    label: 2
                                },
                                3:{
                                    style: {fontSize: "1.3em", color: "black"},
                                    label: 3
                                },
                                4:{
                                    style: {fontSize: "1.3em", color: "black"},
                                    label: 4
                                },
                                5:{
                                    style: {fontSize: "1.3em", color: "black"},
                                    label: 5
                                },
                                6:{
                                    style: {fontSize: "1.3em", color: "black"},
                                    label: 6
                                },
                                7:{
                                    style: {fontSize: "1.3em", color: "black"},
                                    label: 7
                                },
                                8:{
                                    style: {fontSize: "1.3em", color: "black"},
                                    label: 8
                                },
                                9:{
                                    style: {fontSize: "1.3em", color: "black"},
                                    label: 9
                                },
                                10:{
                                    style: {fontSize: "1.3em", color: "black"},
                                    label: <div>10<br></br><strong style={{color: "blue"}}>Signal exists</strong></div>
                                }
                            }}
                        />

                        <button 
                            style={{marginLeft: "22vw"}}
                            disabled={this.state.isDisabled}
                            onClick={() => this.processSelection()}>Confirm rating</button>
                        {/* <div>{this.state.selectedValue}</div> */}
                        
                    </div>
                </div>
            </body>
        )
    }
}

export default Rating;