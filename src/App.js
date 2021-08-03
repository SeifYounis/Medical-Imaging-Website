import React from 'react';
import {
  Switch,
  Route,
  BrowserRouter
} from "react-router-dom";
import AlternateChoices from './pages/afc';
import LoginPage from './pages/login page';
import Testing from './pages/testing';

export function App() {
  return(
    <BrowserRouter>
      <Switch>
        <Route path="/testing">
          <Testing/>
        </Route>
        <Route path="/alternate-choice">
          <AlternateChoices/>
        </Route>
        <Route path="/">
          <LoginPage/>
        </Route>
      </Switch>
    </BrowserRouter>
  )
}

export default App;

// import logo from './logo.svg';
// import './App.css';

// function App() {
// // function getGreeting(user) {
// //   if (user) {
// //     return <h1>Hello, {formatName(user)}!</h1>;
// //   }
// //   return <h1>Hello, Stranger.</h1>;
// // }

//   function formatName(firstName, lastName) {
//     return firstName + ' ' + lastName;
//   }

//   const user = {
//     firstName: 'Seif',
//     lastName: 'Younis'
//   };

//   function Welcome(props) {
//     return <h1>Hello, {formatName(props.firstName, props.lastName)}!</h1>;
//   }

//   return(
//     function tick() {
//       const element = (
//         <div>
//           <Welcome 
//             firstName = {user.firstName} 
//             lastName = {user.lastName}
//           />
//           <h2>Good to see you here.</h2>
//           <h2>It is {new Date().toLocaleTimeString()}.</h2>
//         </div>
//       );

//       return element
//     }
//   )
// }