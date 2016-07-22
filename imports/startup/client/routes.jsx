// import client startup through a single index entry point
// defines all the routes
import React from 'react';
import { Meteor } from 'meteor/meteor';
import { Router, Route, IndexRoute, browserHistory } from 'react-router';
import Login from '../../../imports/ui/components/Login.jsx';

const requireAuth = (nextState, replace) => {
  if (!Meteor.loggingIn() && !Meteor.userId()) {
    replace({
      pathname: '/login',
      state: { nextPathname: nextState.location.pathname },
    });
  }
};

// route components
import AppContainer from '/imports/containers/AppContainer.jsx';
import TrackerPageContainer from '/imports/containers/TrackerPageContainer.jsx';

export const renderRoutes = () => (
  <Router history={browserHistory}>
    <Route path="/" component={AppContainer}>
      <IndexRoute component={TrackerPageContainer} onEnter={requireAuth} />
      <Route path="/login" component={Login} />
    </Route>
  </Router>
);
