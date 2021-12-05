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
import Rating from './pages/rating';
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
          <Testing assessment="testing"/>
        </Route>
        <Route path="/training">
          <Testing assessment="training"/>
        </Route>
        <Route path="/rating">
          <Rating assessment="rating"/>
        </Route>
        <Route path="/alternate-choice">
          <AlternateChoices assessment="2AFC"/>
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