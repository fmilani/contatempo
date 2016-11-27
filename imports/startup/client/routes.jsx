// import client startup through a single index entry point
// defines all the routes
import React from 'react';
import { Meteor } from 'meteor/meteor';
import { Router, Route, IndexRoute, browserHistory } from 'react-router';
import Login from '../../../imports/ui/components/Login.jsx';

const requireAuthAndSettings = (nextState, replace) => {
  if (!Meteor.loggingIn() && !Meteor.userId()) {
    replace({
      pathname: '/login',
      state: { nextPathname: nextState.location.pathname },
    });
  } else if (Meteor.user() && !Meteor.user().settings) {
    replace({
      pathname: '/settings',
      state: { nextPathname: nextState.location.pathname },
    });
  }
};

// route components
import AppContainer from '/imports/containers/AppContainer.jsx';
import TrackerPageContainer from '/imports/containers/TrackerPageContainer.jsx';
import SettingsContainer from '/imports/containers/SettingsContainer.jsx';

// TODO: rearrange routes (separate login from root path and also separete onEnter function)
const renderRoutes = () => (
  <Router history={browserHistory}>
    <Route path="/" component={AppContainer}>
      <IndexRoute component={TrackerPageContainer} onEnter={requireAuthAndSettings} />
      <Route path="/login" component={Login} />
      <Route path="/settings" component={SettingsContainer} />
      <Route path="/:period" component={TrackerPageContainer} onEnter={requireAuthAndSettings} />
    </Route>
  </Router>
);

export default renderRoutes;
