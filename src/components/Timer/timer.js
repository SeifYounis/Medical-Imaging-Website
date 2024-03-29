/**
 * Code for animated countdown timer: https://css-tricks.com/how-to-create-an-animated-countdown-timer-with-html-css-and-javascript/
 */

import { Component } from "react";
import './timer.css'

const FULL_DASH_ARRAY = 283;

let TIME_LIMIT;
let WARNING_THRESHOLD;
const ALERT_THRESHOLD = 3;

export class Timer extends Component {
    constructor() {
        super();

        // Initially, no time has passed, but this will count up
        // and subtract from the TIME_LIMIT
        this.timeLeft = 0;
        this.timerInterval = null;
    }


    formatTime(time) {
        // Seconds are the remainder of the time divided by 60 (modulus operator)
        let seconds = time % 60;

        // Output seconds remaining
        return `${seconds}`;
    }

    calculateTimeFraction() {
        const rawTimeFraction = this.timeLeft / TIME_LIMIT;
        return rawTimeFraction - (1 / TIME_LIMIT) * (1 - rawTimeFraction);
    }

    setCircleDasharray() {
        const circleDasharray = `${(
            this.calculateTimeFraction() * FULL_DASH_ARRAY
        ).toFixed(0)} 283`;
        document
            .getElementById("base-timer-path-remaining")
            .setAttribute("stroke-dasharray", circleDasharray);
    }

    setRemainingPathColor() {
        const COLOR_CODES = {
            info: {
                color: "green"
            },
            warning: {
                color: "orange",
                threshold: WARNING_THRESHOLD
            },
            alert: {
                color: "red",
                threshold: ALERT_THRESHOLD
            }
        };

        const { alert, warning, info } = COLOR_CODES;

        // If the remaining time is less than or equal to 3, change the color on the timer to red
        if (this.timeLeft <= alert.threshold) {
            document
                .getElementById("base-timer-path-remaining")
                .setAttribute("color", alert.color);

            // If the remaining time is less than or equal to 7, change the color on the timer to yellow
        } else if (this.timeLeft <= warning.threshold) {
            document
                .getElementById("base-timer-path-remaining")
                .setAttribute("color", warning.color);

            // If time remaining is greater than 7, timer color should be green
        } else {
            document
                .getElementById("base-timer-path-remaining")
                .setAttribute("color", info.color);
        }
    }

    startTimer(page) {
        let timePassed = 0;

        document.getElementById("medical-scan").style.visibility = "visible";

        this.timerInterval = setInterval(() => {
            // The amount of time passed increments by one
            timePassed = timePassed += 1;
            this.timeLeft = TIME_LIMIT - timePassed;

            // The time left label is updated
            document.getElementById("base-timer-label").innerHTML = this.formatTime(this.timeLeft);

            this.setCircleDasharray();
            this.setRemainingPathColor();

            let currentImage = document.getElementById("medical-scan")

            // Blank out image after certain amount of seconds
            if (this.timeLeft <= WARNING_THRESHOLD) {
                currentImage.style.visibility = "hidden"
            }

            // Mark down question as having no answer if time runs out. 
            // For rating, use the last selected rating scale value
            if (this.timeLeft === 0) {
                if(page.props.assessment === "rating" && page.state.selectedValue !== null) {
                    page.processSelection(page.state.selectedValue)
                }
                else {
                    page.processSelection("No answer")
                }
            }
        }, 1000 * 1);
    }

    componentDidMount() {
        TIME_LIMIT = this.props.configInfo.timeLimit

        // Keep image visible only as long as it's allowed to be
        WARNING_THRESHOLD = TIME_LIMIT - this.props.configInfo.secondsVisible 

        this.timeLeft = TIME_LIMIT;
    }

    render() {
        return (
            <div className="bottom-right">
                <div className="base-timer">
                    <svg className="base-timer__svg" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                        <g className="base-timer__circle">
                            <circle className="base-timer__path-elapsed" cx="50" cy="50" r="45" />
                            <path
                                id="base-timer-path-remaining"
                                strokeDasharray="283"
                                className="base-timer__path-remaining"
                                color="green"
                                d="
                                    M 50, 50
                                    m -45, 0
                                    a 45,45 0 1,0 90,0
                                    a 45,45 0 1,0 -90,0
                                "
                            ></path>
                        </g>
                    </svg>
                    <span id="base-timer-label" className="base-timer__label">
                        {this.props.configInfo.timeLimit}
                    </span>
                </div>
            </div>
        )
    }
}