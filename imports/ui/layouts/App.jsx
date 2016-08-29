import React from 'react';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import AppBar from 'material-ui/AppBar';
import AppDrawer from './AppDrawer.jsx';
import AppTabs from './AppTabs.jsx';

export default class App extends React.Component {

  constructor(props) {
    super(props);

    // bindings
    this.handleDrawer = this.handleDrawer.bind(this);
  }

  getChildContext() {
    // set currentUser to context so it can be accessed throughout the application
    return { currentUser: this.props.currentUser };
  }

  handleDrawer() {
    this.refs.appDrawer.handleToggle();
  }

  render() {
    return (
      <MuiThemeProvider>
        <div>
          <AppBar
            title="Contatempo"
            onLeftIconButtonTouchTap={this.handleDrawer}
            zDepth={0}
          />
          <AppDrawer ref="appDrawer" />
          <AppTabs location={this.props.location} />
          <div>
            {this.props.children}
          </div>
        </div>
      </MuiThemeProvider>
    );
  }
}

App.propTypes = {
  children: React.PropTypes.element,
  currentUser: React.PropTypes.object,
  location: React.PropTypes.object,
};

App.contextTypes = {
  router: React.PropTypes.object,
};

App.childContextTypes = {
  currentUser: React.PropTypes.object,
};
