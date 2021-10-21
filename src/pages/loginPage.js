import { Component } from 'react'
import { withRouter } from 'react-router-dom';

class LoginPage extends Component {
    constructor() {
        super();

        this.state = {
            score: 0.000,
        }
    }

    submitForm(e) {
        e.preventDefault();

        fetch('/postGrade', {
            method: 'POST',
            body: JSON.stringify(this.state),
            headers: {
                'content-Type': 'application/json'
            },
        }).then(function (response) {
            return response
        }).then(function (body) {
            console.log(body);
        });

        this.props.history.push('/access-testing')
    }

    componentDidMount() {
        // fetch('/getInfo')
        // .then(res => {
        //     if(res.ok) {
        //         return res.json();
        //     }
        // }).then(data => {
        //     if(data) {
        //         console.log(data);
        //     }
        // }).catch(err => console.error(err));
    }

    render() {
        return (
            <body>
                <div>
                    <form onSubmit={this.submitForm.bind(this)}>
                        <input
                            type="number"
                            placeholder="Score"
                            step="0.001"
                            onChange={e => this.setState({ score: e.target.value })}>
                            {/* type="text" 
                            placeholder="Username" 
                            onChange={e => this.setState({username: e.target.value})}> */}
                        </input>

                        <button type="submit">Begin</button>
                    </form>
                </div>
            </body>
        )
    }
}

export default withRouter(LoginPage);