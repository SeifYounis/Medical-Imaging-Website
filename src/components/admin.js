import { Component } from "react";

// Adjust timer
// Adjust number of images
// Control when certain assessments are available

class Admin extends Component {
    unlockTesting(e) {
        e.preventDefault();

        fetch('/unlock-testing', {
            method: 'POST',
        })
    }

    // componentDidMount() {

    // }

    render() {
        return (
            <body>
                <button onClick={this.unlockTesting.bind(this)}>
                    Unlock Testing
                </button>
            </body>
        )
    }
}

export default Admin