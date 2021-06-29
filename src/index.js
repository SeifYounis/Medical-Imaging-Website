import React from 'react';
import ReactDOM from 'react-dom';
import {tick} from './App.js'
import Testing from './pages/testing';
import { startTimer } from './pages/testing';
import './index.css';
import reportWebVitals from './reportWebVitals';

// ReactDOM.render(
//   <React.StrictMode>
//     <App />
//   </React.StrictMode>,
//   document.getElementById('root')
// )

// setInterval(tick, 1000*1);

ReactDOM.render(
  <React.StrictMode>
    <Testing />
  </React.StrictMode>,
  document.getElementById('root')
)

startTimer();

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
