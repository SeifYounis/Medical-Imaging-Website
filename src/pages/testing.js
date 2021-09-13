import { Component } from 'react'
import '../styles/testing.css'
import '../styles/timer.css'
import { fadeOutAndfadeIn } from '../assets/fadingAnimation'
import {
    presentImages,
    absentImages
} from '../assets/loadImages'
import { Timer } from '../assets/timer'

var timer = new Timer();

function nextImage(prev_image) {
    let random = (min = 0, max = 10) => {
        let num = Math.random() * (max - min) + min;

        return Math.round(num);
    };
}

class Testing extends Component {
    constructor() {
        super();

        this.state = {
            isDisabled: false
        }
    }

    // Function for picking next image to display and transitioning to it
    processSelection() {
        this.setState({
            isDisabled: true
        });

        clearInterval(timer.timerInterval);

        let image = document.getElementById("medical-scan");

        fadeOutAndfadeIn(image, absentImages[0].default);

        setTimeout(
            function () {
                this.setState({
                    isDisabled: false
                });
            }.bind(this),
            2000
        );

        timer.startTimer();
    }

    componentDidMount() {
        timer.startTimer();
    }

    render() {
        return (
            <body>
                <div class="split left">
                    <div class="centered">
                        <button class="image-button"
                            id="image-button"
                            disabled={this.state.isDisabled}
                            onClick={this.processSelection.bind(this)}>
                            <img src={presentImages[0].default} alt="medical-scan" id="medical-scan" />
                        </button>
                    </div>
                </div>

                <div class="split right">
                    <div class="top-right">
                        <h1 class="testing-prompt">Click on the image if you believe it contains a signal. Otherwise, click 'No'</h1>
                    </div>

                    <div class="center-right">
                        <button class="no-button" id="no-button"
                            disabled={this.state.isDisabled}
                            onClick={this.processSelection.bind(this)}
                        >No</button>
                    </div>

                    <Timer/>
                </div>
            </body>
        )
    }
}

export default Testing;