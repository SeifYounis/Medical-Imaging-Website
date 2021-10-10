import { Component } from "react";
import Testing from "./testing";

class AccessTesting extends Component {
    constructor() {
        super();

        this.state = {
            unlocked: null
        }
    }

    accessAssessmemt() {
        if(this.state.unlocked) {
            return <Testing/>
        }

        return <h1>Can't access this assessment</h1>
    }

    componentDidMount() {
        fetch('/unlocked-testing', {
            method: 'POST',
        })
        .then(res => {
            if(res.ok) {
                return res.json();
            }
        }).then(data => {
            if(data) {
                this.setState({
                    unlocked: data.unlocked
                })
                
                // console.log(this.state);
            }
        }).catch(err => console.error(err));
    }
    
    render() {
        return this.accessAssessmemt()
    }
}

export default AccessTesting;