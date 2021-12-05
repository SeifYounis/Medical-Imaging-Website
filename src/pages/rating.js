import React, { Component } from 'react'
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

// Left rating at 0 and it timed out: no activity
// Rating at 0 and confirmed/everything else: intentional answer

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
            buttonDisabled: true,
            sliderDisabled: false,
            selectedValue: null,
            totalAnswered: 0,
            promptImage: null,
            solution: null,
            testOver: false,
        }
    }

    // Load new image
    newImage() {
        let random = (min, max) => {
            let num = Math.random() * (max - min) + min;
    
            return Math.round(num);
        };

        var condition;
        var image

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
                solution: "No signal present in image"
            })

            // console.log("Absent Images Length: " + absentImages.length)

            let index = random(0, absentImages.length - 1);
            image = absentImages[index].default

            absentImages.splice(index, 1);
        } else {
            this.setState({
                solution: "Signal present in image"
            })

            // console.log("Present Images Length: " + presentImages.length)

            let index = random(0, presentImages.length - 1);
            image = presentImages[index].default

            presentImages.splice(index, 1);
        }

        this.setState({
            promptImage: image
        })

        return image
    }

    processSelection(selectedValue) {
        console.log(this.state.totalAnswered)

        clearInterval(timer.timerInterval);

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

        if (this.state.totalAnswered < 20) {
            this.setState({
                buttonDisabled: true,
                sliderDisabled: true,
                totalAnswered: this.state.totalAnswered + 1,
                selectedValue: null
            });

            let image = document.getElementById("medical-scan");
            image.style.visibility = 'visible';

            let date = new Date().toLocaleString();

            fetch('/add-selection', {
                method: 'POST',
                body: JSON.stringify({
                    assessment: this.props.assessment,
                    promptImage: this.state.promptImage,
                    answer: selectedValue,
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
            });

            if(this.state.totalAnswered + 1 < 20) {
                fadeOutAndfadeIn(image, this.newImage());

                setTimeout(() => {
                    this.setState({
                        sliderDisabled: false,
                    });
                }, 2000);

                timer.startTimer(this)
            } else {
                setTimeout(() => {
                    this.setState({testOver: true})
                }, 2500)
            }
        }
    }


    handleOnChange = (value) => {
        this.setState({
            selectedValue: value,
            buttonDisabled: false
        }) 

        // console.log(slider.marks)
    }

    componentDidMount() {
        document.getElementById('medical-scan').src = this.newImage()

        timer.startTimer(this);
    }

    render() {
        if(this.state.testOver) {
            return (
                <p>You have completed the <b>{this.props.assessment}</b> assessment</p>
            )
        }

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
                        <Slider 
                            className='slider'
                            trackStyle={{ backgroundColor: 'yellow', height: 10 }}
                            style={{
                                marginTop:"10vh", 
                                marginLeft: "3vw", 
                                marginBottom: "10vh", 
                                // transform: 'translate(-50%, -50%)',
                                width:"44vw",
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
                            disabled={this.state.sliderDisabled}
                            value={this.state.selectedValue}
                            onChange={this.handleOnChange}
                            marks={{
                                "-10":{
                                    style: {fontSize: "1.3em", color: "black"},
                                    label: <div>10<br/> <br/> <br/><strong style={{color: "red", marginLeft: '3vw'}}>No signal</strong></div>
                                },
                                "-8":{
                                    style: {fontSize: "1.3em", color: "black"},
                                    label: -8
                                },
                                "-6":{
                                    style: {fontSize: "1.3em", color: "black"},
                                    label: -6
                                },
                                "-4":{
                                    style: {fontSize: "1.3em", color: "black"},
                                    label: -4
                                },
                                "-2":{
                                    style: {fontSize: "1.3em", color: "black"},
                                    label: -2
                                },
                                0:{
                                    style: {fontSize: "1.3em", color: "black"},
                                    label: 0
                                },
                                2:{
                                    style: {fontSize: "1.3em", color: "black"},
                                    label: 2
                                },
                                4:{
                                    style: {fontSize: "1.3em", color: "black"},
                                    label: 4
                                },
                                6:{
                                    style: {fontSize: "1.3em", color: "black"},
                                    label: 6
                                },
                                
                                8:{
                                    style: {fontSize: "1.3em", color: "black"},
                                    label: 8
                                },
                                
                                10:{
                                    style: {fontSize: "1.3em", color: "black"},
                                    label: <div>10<br/> <br/> <br/><strong style={{color: "blue"}}>Signal exists</strong></div>
                                }
                            }}
                        />

                        <button 
                            id='submit-rating'
                            style={{marginLeft: "20vw"}}
                            disabled={this.state.buttonDisabled}
                            onClick={() => {
                                this.processSelection(this.state.selectedValue);
                            }}>Confirm rating: {this.state.selectedValue}</button>
                        
                    </div>

                    <Timer/>
                </div>
            </body>
        )
    }
}

export default Rating;