// import client startup through a single index entry point
// defines all the routes
import React from 'react';
import { Router, Route, IndexRoute, browserHistory } from 'react-router';

// route components
import AppContainer from '/imports/containers/AppContainer.jsx';
import TrackerPage from '/imports/ui/components/TrackerPage.jsx';

export const renderRoutes = () => (
  <Router history={browserHistory}>
    <Route path="/" component={AppContainer}>
      <IndexRoute component={TrackerPage} />
    </Route>
  </Router>
);
