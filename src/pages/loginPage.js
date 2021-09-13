import React from 'react'
import { withRouter } from 'react-router-dom';

class LoginPage extends React.Component {
    constructor() {
        super();

        this.state = {
            score: 0.000
        }

        // this.state = {
        //     username: '',
        //     score: 0.000
        // };
    }

    submitForm (e) {
        e.preventDefault();

        fetch('/application', { 
            method: 'POST',
            body: JSON.stringify(this.state),
            headers: {
                'content-Type': 'application/json'
            }
          })
          .then(function(response) {
            return response.json()
          }).then(function(body) {
            console.log(body);
          });

        this.props.history.push('/testing')
    }

    render() {
        return (
            <div>
                <form onSubmit={this.submitForm.bind(this)}>
                    <input 
                        // type="text" 
                        // placeholder="Username" 
                        // onChange={e => this.setState({username: e.target.value})}>
                        type="number"
                        placeholder="Score"
                        step="0.001"
                        onChange={e => this.setState({score: e.target.value})}>
                    </input>

                    <button type="submit">Begin</button>
                </form>
            </div>
        )
    }
}

export default withRouter(LoginPage);