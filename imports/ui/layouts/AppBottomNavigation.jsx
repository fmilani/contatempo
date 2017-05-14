import React from 'react';
import { withRouter } from 'react-router';
import { i18n } from 'meteor/universe:i18n';
import Paper from 'material-ui/Paper';
import { BottomNavigation, BottomNavigationItem } from 'material-ui/BottomNavigation';
import PlayIcon from 'material-ui/svg-icons/av/play-arrow';
import HistoryIcon from 'material-ui/svg-icons/action/history';
import URLS from '../../api/helpers/urls';
import { AppSession, AppSessionFields } from '../../session/session';

/**
 * Maps each path to the index in the bottom navigation
 */
const MAP_PATH_TO_INDEX = {
  [URLS.ROO]: 0,
  [URLS.NOW]: 0,
  [URLS.HISTORY.ROOT]: 1,
};

/**
 * Gets the index for the given path
 * @param {string} path the current location path
 */
const getIndexForPath = path => MAP_PATH_TO_INDEX[`/${path.split('/')[1]}`];

/**
 * The app bottom navigation
 */
const AppBottomNavigation = props => (
  <Paper
    style={{
      width: '100%',
      position: 'fixed',
      bottom: 0,
      zIndex: 9999,
    }}
    zDepth={2}
  >
    <BottomNavigation selectedIndex={getIndexForPath(props.location.pathname)}>
      <BottomNavigationItem
        label={i18n.getTranslation('common.now')}
        icon={<PlayIcon />}
        onTouchTap={() => props.router.push(URLS.NOW)}
      />
      <BottomNavigationItem
        label={i18n.getTranslation('common.history')}
        icon={<HistoryIcon />}
        onTouchTap={() => {
          props.router.push(AppSession.get(
            AppSessionFields.LAST_HISTORY_PERIOD) || URLS.HISTORY.LAST_MONTH,
          );
        }}
      />
    </BottomNavigation>
  </Paper>
);

AppBottomNavigation.propTypes = {
  location: React.PropTypes.shape({
    pathname: React.PropTypes.string,
  }).isRequired,
  router: React.PropTypes.shape({
    push: React.PropTypes.func,
  }).isRequired,
};

export default withRouter(AppBottomNavigation);
