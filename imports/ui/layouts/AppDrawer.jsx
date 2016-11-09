import React from 'react';
import { Meteor } from 'meteor/meteor';
import { i18n } from 'meteor/universe:i18n';
import Drawer from 'material-ui/Drawer';
import { indigo500 } from 'material-ui/styles/colors';
import Avatar from 'material-ui/Avatar';
import MenuItem from 'material-ui/MenuItem';
import Divider from 'material-ui/Divider';

export default class AppDrawer extends React.Component {

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
    this.context.router.push(route);
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

    return (
      <div>
        <Drawer
          open={this.state.open}
          docked={false}
          onRequestChange={(open) => this.setState({ open })}
        >
          {Meteor.user() ? (
            <div
              style={{
                padding: '12px',
                backgroundColor: indigo500, // TODO: get primary1Color from theme
              }}
            >
              <Avatar
                src={this.context.currentUser.picture}
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
                {this.context.currentUser.name}
              </span>
            </div>
          ) : ''}
          <MenuItem onTouchTap={() => this.handleRedirect('/day')}>
            <T>common.today</T>
          </MenuItem>
          <MenuItem onTouchTap={() => this.handleRedirect('/month')}>
            <T>common.this_month</T>
          </MenuItem>
          <MenuItem onTouchTap={() => this.handleRedirect('/last_month')}>
            <T>common.last_month</T>
          </MenuItem>
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

AppDrawer.contextTypes = {
  router: React.PropTypes.object,
  currentUser: React.PropTypes.object,
};
