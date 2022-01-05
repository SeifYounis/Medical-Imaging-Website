import React from 'react';
import {
  Switch,
  Route,
  BrowserRouter
} from "react-router-dom";
import AlternateChoices from './components/afc';
import LoginPage from './components/loginPage';
import Testing from './components/testing';
import Admin from './components/admin';
import AccessTesting from './components/accessTesting'
import Rating from './components/rating';
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