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
        <Route path="/training">
          <AccessAssessment assessment="training" guided={true}/>
        </Route>
        <Route path="/training-solo">
          <AccessAssessment assessment="training" guided={false}/>
        </Route> 
        <Route path="/testing1">
          <AccessAssessment assessment="testing1" guided={true}/>
        </Route>
        <Route path="/testing1-solo">
          <AccessAssessment assessment="testing1" guided={false}/>
        </Route> 
        <Route path="/testing2">
          <AccessAssessment assessment="testing2" guided={true}/>
        </Route>
        <Route path="/testing2-solo">
          <AccessAssessment assessment="testing2" guided={false}/>
        </Route> 
        <Route path="/rating">
          <AccessAssessment assessment="rating" guided={true}/>
        </Route>
        <Route path="/rating-solo">
          <AccessAssessment assessment="rating-solo" guided={false}/>
        </Route>
        <Route path="/alternative-choice">
          <AccessAssessment assessment="2AFC" guided={true}/>
        </Route>
        <Route path="/alternative-choice-solo">
          <AccessAssessment assessment="2AFC" guided={false}/>
        </Route>
        <Route path="/login">
          <LoginPage/>
        </Route>
      </Switch>
    </BrowserRouter>
  )
}

export default App;