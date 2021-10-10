import { Component } from "react";

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