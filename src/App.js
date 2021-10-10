import React from 'react';
import {
  Switch,
  Route,
  BrowserRouter
} from "react-router-dom";
import AlternateChoices from './pages/afc';
import LoginPage from './pages/loginPage';
import Testing from './pages/testing';
import Admin from './pages/admin';
import AccessTesting from './pages/accessTesting'
// import Home from './pages/home';

export function App() {
  return(
    <BrowserRouter>
      <Switch>
        <Route path="/admin">
          <Admin/>
        </Route>
        <Route path="/access-testing">
          <AccessTesting/>
        </Route>
        <Route path="/testing">
          <Testing/>
        </Route>
        <Route path="/alternate-choice">
          <AlternateChoices/>
        </Route>
        <Route path="/login">
          <LoginPage/>
        </Route>
        {/* <Route path="/">
          <Home/>
        </Route> */}
      </Switch>
    </BrowserRouter>
  )
}

export default App;