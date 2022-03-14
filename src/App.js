import React from 'react';
import {
  Switch,
  Route,
  BrowserRouter
} from "react-router-dom";
import Admin from './components/admin';
import LoginPage from './components/loginPage';
import AccessAssessment from './components/accessAssessment';
// import TestingAndTraining from './components/TestingAndTraining/TestingAndTraining';
// import Rating from './components/Rating/rating';
// import AlternateChoices from './components/2AFC/afc';

export function App() {
  return(
    <BrowserRouter>
      <Switch>
        <Route path="/admin">
          <Admin/>
        </Route>
        <Route path="/testing">
          <AccessAssessment assessment="testing"/>
        </Route>
        {/* <Route path="/just-testing">
          <TestingAndTraining assessment="testing"/>
        </Route> */}
        <Route path="/training">
          <AccessAssessment assessment="training"/>
        </Route>
        {/* <Route path="/just-training">
          <TestingAndTraining assessment="training"/>
        </Route>  */}
        <Route path="/rating">
          <AccessAssessment assessment="rating"/>
        </Route>
        {/* <Route path="/just-rating">
          <Rating assessment="rating"/>
        </Route> */}
        <Route path="/alternate-choice">
          <AccessAssessment assessment="2AFC"/>
        </Route>
        {/* <Route path="/just-alternate-choice">
          <AlternateChoices assessment="2AFC"/>
        </Route> */}
        <Route path="/login">
          <LoginPage/>
        </Route>
      </Switch>
    </BrowserRouter>
  )
}

export default App;