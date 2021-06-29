//import logo from './logo.svg';
import './App.css';

function App() {
  // return (
  //   <div className="App">
  //     <header className="App-header">
  //       <img src={logo} className="App-logo" alt="logo" />
  //       <p>
  //         Edit <code>src/App.js</code> and save to reload.
  //       </p>
  //       <a
  //         className="App-link"
  //         href="https://reactjs.org"
  //         target="_blank"
  //         rel="noopener noreferrer"
  //       >
  //         Learn React
  //       </a>
  //     </header>
  //   </div>
  // );

  // function getGreeting(user) {
//   if (user) {
//     return <h1>Hello, {formatName(user)}!</h1>;
//   }
//   return <h1>Hello, Stranger.</h1>;
// }

  function formatName(firstName, lastName) {
    return firstName + ' ' + lastName;
  }

  const user = {
    firstName: 'Seif',
    lastName: 'Younis'
  };

  function Welcome(props) {
    return <h1>Hello, {formatName(props.firstName, props.lastName)}!</h1>;
  }

  return(
    function tick() {
      const element = (
        <div>
          <Welcome 
            firstName = {user.firstName} 
            lastName = {user.lastName}
          />
          <h2>Good to see you here.</h2>
          <h2>It is {new Date().toLocaleTimeString()}.</h2>
        </div>
      );

      return element
    }
  )
}

export default App;