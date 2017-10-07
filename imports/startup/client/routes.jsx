// import client startup through a single index entry point
// defines all the routes
import React from 'react';
import { Meteor } from 'meteor/meteor';
import {
  Router,
  Route,
  Redirect,
  IndexRedirect,
  browserHistory,
} from 'react-router';
import { URLS } from '../../api/helpers/urls.js';
// route components
import Login from '../../ui/components/Login.jsx';
import AppContainer from '../../containers/AppContainer.jsx';
import HistoryPageContainer from '../../containers/HistoryPageContainer.jsx';
import SettingsContainer from '../../containers/SettingsContainer.jsx';
import NowPage from '../../ui/pages/NowPage.jsx';

// checks if user has all needed settings set
const userHasAllSettings = () => {
  const { endOfMonth, timezone } = Meteor.user().settings;

  return endOfMonth && timezone;
};

// TODO: DRY. This method is too similar to requireAuthAndSettings
const requireAuth = (nextState, replace) => {
  if (!Meteor.loggingIn() && !Meteor.userId()) {
    replace({
      pathname: URLS.LOGIN,
      state: { nextPathname: nextState.location.pathname },
    });
  }
};

const requireAuthAndSettings = (nextState, replace) => {
  if (!Meteor.loggingIn() && !Meteor.userId()) {
    replace({
      pathname: URLS.LOGIN,
      state: { nextPathname: nextState.location.pathname },
    });
  } else if (Meteor.user() && !userHasAllSettings()) {
    replace({
      pathname: URLS.SETTINGS,
      state: { nextPathname: nextState.location.pathname },
    });
  }
};

// TODO: rearrange routes (separate login from root path and also separete onEnter function)
const renderRoutes = () => (
  <Router history={browserHistory}>
    <Route path={URLS.ROOT} component={AppContainer}>
      <IndexRedirect to={URLS.NOW} />

      <Route path={URLS.LOGIN} component={Login} />
      <Route
        path={URLS.SETTINGS}
        component={SettingsContainer}
        onEnter={requireAuth}
      />

      <Route
        path={URLS.NOW}
        component={NowPage}
        onEnter={requireAuthAndSettings}
      />

      <Route
        path={`${URLS.HISTORY.ROOT}/:period`}
        component={HistoryPageContainer}
        onEnter={requireAuthAndSettings}
      />
      <Redirect from={URLS.HISTORY.ROOT} to={`${URLS.HISTORY.LAST_MONTH}`} />
    </Route>
  </Router>
);

export default renderRoutes;
