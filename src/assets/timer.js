/**
 * Code for animated countdown timer: https://css-tricks.com/how-to-create-an-animated-countdown-timer-with-html-css-and-javascript/
 */

import { Component } from "react";

export class Timer extends Component {
    constructor() {
        super();

        this.FULL_DASH_ARRAY = 283;
        this.TIME_LIMIT = 10;
        this.WARNING_THRESHOLD = 7;
        this.ALERT_THRESHOLD = 3;

        // Initially, no time has passed, but this will count up
        // and subtract from the TIME_LIMIT
        this.timeLeft = this.TIME_LIMIT;
        this.timerInterval = null;
    }


    formatTime(time) {
        // Seconds are the remainder of the time divided by 60 (modulus operator)
        let seconds = time % 60;

        // Output seconds remaining
        return `${seconds}`;
    }

    calculateTimeFraction() {
        const rawTimeFraction = this.timeLeft / this.TIME_LIMIT;
        return rawTimeFraction - (1 / this.TIME_LIMIT) * (1 - rawTimeFraction);
    }

    setCircleDasharray() {
        const circleDasharray = `${(
            this.calculateTimeFraction() * this.FULL_DASH_ARRAY
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
                threshold: this.WARNING_THRESHOLD
            },
            alert: {
                color: "red",
                threshold: this.ALERT_THRESHOLD
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

    startTimer() {
        let timePassed = 0;

        this.timerInterval = setInterval(() => {
            // The amount of time passed increments by one
            timePassed = timePassed += 1;
            this.timeLeft = this.TIME_LIMIT - timePassed;

            // The time left label is updated
            document.getElementById("base-timer-label").innerHTML = this.formatTime(this.timeLeft);

            this.setCircleDasharray();
            this.setRemainingPathColor();

            if (this.timeLeft === 0) {
                clearInterval(this.timerInterval);
            }
        }, 1000 * 1);
    }

    render() {
        return (
            <div class="bottom-right">
                <div class="base-timer">
                    <svg class="base-timer__svg" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                        <g class="base-timer__circle">
                            <circle class="base-timer__path-elapsed" cx="50" cy="50" r="45" />
                            <path
                                id="base-timer-path-remaining"
                                stroke-dasharray="283"
                                class="base-timer__path-remaining"
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
                    <span id="base-timer-label" class="base-timer__label">
                        {10}
                    </span>
                </div>
            </div>
        )
    }
}