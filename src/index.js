import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import reportWebVitals from './reportWebVitals';

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
  ReactDOM.render(
    element, 
    document.getElementById('root')
  );
}

setInterval(tick, 1000*1);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
