import React from 'react';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import AppBar from 'material-ui/AppBar';
import AppDrawer from './AppDrawer.jsx';

export default class App extends React.Component {

  constructor(props) {
    super(props);

    // bindings
    this.handleDrawer = this.handleDrawer.bind(this);
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
          />
          <AppDrawer ref="appDrawer" />
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
};

App.contextTypes = {
  router: React.PropTypes.object,
};
