import React from 'react';
import { Meteor } from 'meteor/meteor';
import { withRouter } from 'react-router';
import { i18n } from 'meteor/universe:i18n';
import Drawer from 'material-ui/Drawer';
import { List, ListItem } from 'material-ui/List';
import { indigo500 } from 'material-ui/styles/colors';
import Avatar from 'material-ui/Avatar';
import MenuItem from 'material-ui/MenuItem';
import PlayIcon from 'material-ui/svg-icons/av/play-arrow';
import HistoryIcon from 'material-ui/svg-icons/action/history';
import Divider from 'material-ui/Divider';
import URLS from '../../api/helpers/urls.js';
import { AppSession, AppSessionFields } from '../../session/session';

class AppDrawer extends React.Component {

  constructor(props) {
    super(props);
    this.state = { open: false };

    // bindings
    this.handleToggle = this.handleToggle.bind(this);
    this.handleClose = this.handleClose.bind(this);
    this.handleRedirect = this.handleRedirect.bind(this);
    this.handleLogout = this.handleLogout.bind(this);
  }

  handleRedirect(route) {
    AppSession.set(AppSessionFields.LAST_HISTORY_PERIOD, route);
    this.props.router.push(route);
    this.handleClose();
  }

  handleToggle() {
    this.setState({ open: !this.state.open });
  }

  handleClose() {
    this.setState({ open: false });
  }

  handleLogout() {
    Meteor.logout(() => this.handleRedirect('/login'));
    this.handleClose();
  }

  render() {
    const T = i18n.createComponent();

    const { userName, userPictureUrl } = this.props;

    return (
      <div>
        <Drawer
          open={this.state.open}
          docked={false}
          onRequestChange={open => this.setState({ open })}
          containerStyle={{ zIndex: 10000 }}
        >
          {Meteor.user() ? (
            <div
              style={{
                padding: '12px',
                backgroundColor: indigo500, // TODO: get primary1Color from theme
              }}
            >
              <Avatar
                src={userPictureUrl}
                style={{
                  verticalAlign: 'middle',
                }}
              />
              <span
                style={{
                  marginLeft: '15px',
                  color: '#fff',
                  verticalAlign: 'middle',
                }}
              >
                {userName}
              </span>
            </div>
          ) : ''}
          <List>
            <ListItem
              primaryText={i18n.getTranslation('common.now')}
              leftIcon={<PlayIcon />}
              onTouchTap={() => this.handleRedirect(URLS.NOW)}
            />
            <ListItem
              primaryText={i18n.getTranslation('common.history')}
              leftIcon={<HistoryIcon />}
              initiallyOpen
              primaryTogglesNestedList
              nestedItems={[
                <MenuItem
                  key={1}
                  primaryText={i18n.getTranslation('period.this_week')}
                  onTouchTap={() => this.handleRedirect(URLS.HISTORY.THIS_WEEK)}
                  insetChildren
                />,
                <MenuItem
                  key={2}
                  primaryText={i18n.getTranslation('period.this_month')}
                  onTouchTap={() => this.handleRedirect(URLS.HISTORY.THIS_MONTH)}
                  insetChildren
                />,
                <MenuItem
                  key={3}
                  primaryText={i18n.getTranslation('period.last_week')}
                  onTouchTap={() => this.handleRedirect(URLS.HISTORY.LAST_WEEK)}
                  insetChildren
                />,
                <MenuItem
                  key={4}
                  primaryText={i18n.getTranslation('period.last_month')}
                  onTouchTap={() => this.handleRedirect(URLS.HISTORY.LAST_MONTH)}
                  insetChildren
                />,
              ]}
            />
          </List>
          {Meteor.user() ? (
            <div style={{ position: 'absolute', bottom: '0', width: '100%' }}>
              <MenuItem onTouchTap={() => this.handleRedirect('/settings')}>
                <T>common.settings</T>
              </MenuItem>
              <Divider />
              <MenuItem onTouchTap={this.handleLogout}>
                <T>drawer.logout</T>
              </MenuItem>
            </div>
          ) : ''}
        </Drawer>
      </div>
    );
  }
}

AppDrawer.propTypes = {
  router: React.PropTypes.shape({
    push: React.PropTypes.func,
  }).isRequired,
  userName: React.PropTypes.string,
  userPictureUrl: React.PropTypes.string,
};

AppDrawer.defaultProps = {
  userName: 'Login',
  userPictureUrl: null,
};

export default withRouter(AppDrawer, { withRef: true });
