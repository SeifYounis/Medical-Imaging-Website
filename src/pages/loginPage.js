import { Component } from 'react'
import { withRouter } from 'react-router-dom';

class LoginPage extends Component {
    constructor() {
        super();

        // this.state = {
        //     score: 0.000,
        // }
        
        this.state = {
            username: null,
            usernameSet: false
        }
    }

    submitForm(e) {
        e.preventDefault();

        // fetch('/postGrade', {
        //     method: 'POST',
        //     body: JSON.stringify(this.state),
        //     headers: {
        //         'content-Type': 'application/json'
        //     },
        // }).then(function (response) {
        //     return response
        // }).then(function (body) {
        //     console.log(body);
        // });

        fetch('/set-username', {
            method: 'POST',
            body: JSON.stringify({username: this.state.username}),
            headers: {
                'content-Type': 'application/json'
            },
        }).then(function (response) {
            return response
        }).then(function (body) {
            console.log(body);
        });

        this.setState({
            usernameSet: true
        })

        // this.props.history.push('/access-testing')
    }

    usernameExists() {
        if(this.state.usernameSet) {
            return(
                <body>
                    <p>Welcome, {this.state.username}</p>
                </body>
            )
        }

        return(
            <div>
                <form onSubmit={this.submitForm.bind(this)}>
                    <input
                        id="user-login"
                        type="text" 
                        placeholder="Username"
                        onChange={e => this.setState({ username: e.target.value })}>
                    </input>

                    <button type="submit">Begin</button>
                </form>
            </div>
        )
    }

    componentDidMount() {
        fetch('/get-username')
        .then(res => {
            if(res.ok) {
                return res.json();
            }
        }).then(data => {
            if(data) {
                console.log(data)

                if(data.username) {
                    this.setState({
                        username: data.username,
                        usernameSet: true
                    })
                }
            }
        }).catch(err => console.error(err));
    }

    render() {
        return this.usernameExists()

        // return (
        //     <body>
        //         {/* <div>
        //             <form onSubmit={this.submitForm.bind(this)}>
        //                 <input
        //                     type="number"
        //                     placeholder="Score"
        //                     step="0.001"
        //                     onChange={e => this.setState({ score: e.target.value })}>
        //                 </input>

        //                 <button type="submit">Begin</button>
        //             </form>
        //         </div> */}

        //         <div>
        //             <form onSubmit={this.submitForm.bind(this)}>
        //                 <input
        //                     type="text" 
        //                     placeholder="Username" 
        //                     onChange={e => this.setState({username: e.target.value})}>
        //                 </input>

        //                 <button type="submit">Begin</button>
        //             </form>
        //         </div>
        //     </body>
        // )
    }
}

export default withRouter(LoginPage);