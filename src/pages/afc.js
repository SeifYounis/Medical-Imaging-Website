import React, { Component } from 'react'
import '../styles/afc.css'
import { fadeOutAndfadeIn } from '../assets/fadingAnimation'
import {
    presentImages,
    absentImages
} from '../assets/loadImages'

class AlternateChoices extends Component {
    constructor() {
        super();

        this.state = {
            clickDisabled: false,
            keyDisabled: false,
            correct: 0,
            totalAnswered: 0,
            score: 0,
            correctSide: null,
        }
    }

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
                this.setState({
                    correctSide: "Left"
                })

                leftImage = presentImage
                rightImage = absentImage
            } else {
                this.setState({
                    correctSide: "Right"
                })

                leftImage = absentImage
                rightImage = presentImage
            }

            return [leftImage, rightImage]
        }

        return []
    }

    processSelection(selectedSide) {
        this.setState({
            clickDisabled: true,
            keyDisabled: true,
            totalAnswered: this.state.totalAnswered + 1,
        });

        if (selectedSide === this.state.correctSide) {
            this.setState({
                score: (this.state.correct + 1)/(this.state.totalAnswered + 1),
                correct: this.state.correct + 1
            })
        } else {
           this.setState({
                score: this.state.correct/(this.state.totalAnswered + 1),
            })
        }

        let nextPair = this.newPair()
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
        }
    }

    componentDidMount() {
        var firstPair = this.newPair()

        // Set first left and right images
        document.getElementById("scan-left").src = firstPair[0]
        document.getElementById("scan-right").src = firstPair[1]

        // Add event listener so certain keystrokes are linked to responses
        document.addEventListener('keydown', (event) => {
            if (!this.state.keyDisabled) {
                if (event.key === "f" || event.key === "j") {

                    if (event.key === "f") {
                        this.processSelection("Left")
                    }
    
                    else if (event.key === "j") {
                        this.processSelection("Right")
                    }
                }
            }
        });
    }

    render() {
        return (
            <body>
                <div class="header" id="afc-prompt">
                    <h1 class="afc-prompt part-1">
                        One of these images contains a signal. 
                        Click on the image you believe contains a signal. 
                    </h1>
        
                    <h1 class="afc-prompt part-2">
                        You can also press 'F' to select the left image or 'J' to select the right image
                    </h1>
                </div>
    
                <div class="split left" id="split-afc">
                    <div class="centered">
                        <button 
                            class="image-button" 
                            id="image-button"
                            disabled={this.state.clickDisabled}
                            onClick={() => this.processSelection("Left")}>
                            <img alt="Left scan" id="scan-left"/>
                        </button>
                    </div>
                </div>
    
                <div class="split right" id="split-afc">
                    <div class="centered">
                        <button 
                            class="image-button" 
                            id="image-button"
                            disabled={this.state.clickDisabled}
                            onClick={() => this.processSelection("Right")}>
                            <img alt="Right scan" id="scan-right"/>
                        </button>
                    </div>
                </div>
            </body>
        )
    }
}

export default AlternateChoices;