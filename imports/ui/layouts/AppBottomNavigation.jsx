import React from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router';
import { i18n } from 'meteor/universe:i18n';
import Paper from 'material-ui/Paper';
import {
  BottomNavigation,
  BottomNavigationItem,
} from 'material-ui/BottomNavigation';
import PlayIcon from 'material-ui/svg-icons/av/play-arrow';
import HistoryIcon from 'material-ui/svg-icons/action/history';
import SettingsIcon from 'material-ui/svg-icons/action/settings';
import PlanningIcon from 'material-ui/svg-icons/action/event';
import Konami from 'react-konami';
import { URLS } from '../../api/helpers/urls';
import { AppSession, AppSessionFields } from '../../session/session';

/**
 * Maps each path to the index in the bottom navigation
 */
const MAP_PATH_TO_INDEX = {
  [URLS.ROO]: 0,
  [URLS.NOW]: 0,
  [URLS.HISTORY.ROOT]: 1,
  [URLS.SETTINGS]: 2,
};

/**
 * Gets the index for the given path
 * @param {string} path the current location path
 */
const getIndexForPath = path => MAP_PATH_TO_INDEX[`/${path.split('/')[1]}`];

/**
 * The app bottom navigation
 */
class AppBottomNavigation extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      showPlanningButton: false,
    };
  }

  getItems() {
    const items = [];
    items.push(
      <BottomNavigationItem
        key={0}
        label={i18n.getTranslation('common.now')}
        icon={<PlayIcon />}
        onTouchTap={() => this.props.router.push(URLS.NOW)}
      />,
      <BottomNavigationItem
        key={1}
        label={i18n.getTranslation('common.history')}
        icon={<HistoryIcon />}
        onTouchTap={() => {
          this.props.router.push(
            AppSession.get(AppSessionFields.LAST_HISTORY_PERIOD) ||
              URLS.HISTORY.LAST_MONTH,
          );
        }}
      />,
      <BottomNavigationItem
        key={2}
        label={i18n.getTranslation('common.settings_short')}
        icon={<SettingsIcon />}
        onTouchTap={() => this.props.router.push(URLS.SETTINGS)}
      />,
    );

    if (this.state.showPlanningButton) {
      items.push(
        <BottomNavigationItem
          key={3}
          label={i18n.getTranslation('Planejar')}
          icon={<PlanningIcon />}
          onTouchTap={() => alert('Erro 4612: Você não tem planos')}
        />,
      );
    }
    return items;
  }

  render() {
    return (
      <Paper
        style={{
          width: '100%',
          position: 'fixed',
          bottom: 0,
          zIndex: 9999,
        }}
        zDepth={2}
      >
        <BottomNavigation
          selectedIndex={getIndexForPath(this.props.location.pathname)}
        >
          {this.getItems().map(item => item)}
        </BottomNavigation>
        <Konami easterEgg={() => this.setState({ showPlanningButton: true })} />
      </Paper>
    );
  }
}

AppBottomNavigation.propTypes = {
  location: PropTypes.shape({
    pathname: PropTypes.string,
  }).isRequired,
  router: PropTypes.shape({
    push: PropTypes.func,
  }).isRequired,
};

export default withRouter(AppBottomNavigation);
