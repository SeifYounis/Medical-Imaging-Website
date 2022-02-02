import React from 'react';
import {
  Switch,
  Route,
  BrowserRouter
} from "react-router-dom";
// import AlternateChoices from './components/2AFC/afc';
import AccessAFC from './components/2AFC/accessAFC';
import AccessRating from './components/Rating/accessRating';
import AccessTesting from './components/accessTesting';
import AccessTraining from './components/accessTraining';
import LoginPage from './components/loginPage';
import Testing from './components/testing';
import Admin from './components/admin';
// import Rating from './components/Rating/rating';
// import Home from './pages/home';

export function App() {
  return(
    <BrowserRouter>
      <Switch>
        <Route path="/admin">
          <Admin/>
        </Route>
        {/* <Route path="/testing">
          <Testing assessment="testing"/>
        </Route> */}
        <Route path="/testing">
          <AccessTesting assessment="testing"/>
        </Route>
        {/* <Route path="/training">
          <Testing assessment="training"/>
        </Route> */}
        <Route path="/training">
          <AccessTraining assessment="training"/>
        </Route>
        {/* <Route path="/rating">
          <Rating assessment="rating"/>
        </Route> */}
        <Route path="/rating">
          <AccessRating assessment="rating"/>
        </Route>
        {/* <Route path="/alternate-choice">
          <AlternateChoices assessment="2AFC"/>
        </Route> */}
        <Route path="/alternate-choice">
          <AccessAFC assessment="2AFC"/>
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