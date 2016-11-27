import React from 'react';
import AppBar from 'material-ui/AppBar';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import {
  indigo500,
  indigo700,
} from 'material-ui/styles/colors';
import AppDrawer from './AppDrawer.jsx';
import AppTabs from './AppTabs.jsx';


const muiTheme = getMuiTheme({
  palette: {
    primary1Color: indigo500,
    primary2Color: indigo700,
    pickerHeaderColor: indigo500,
  },
});

class App extends React.Component {

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
    this.appDrawer.handleToggle();
  }

  render() {
    return (
      <MuiThemeProvider muiTheme={muiTheme}>
        <div>
          <AppBar
            title="Contatempo"
            onLeftIconButtonTouchTap={this.handleDrawer}
            zDepth={0}
          />
          <AppDrawer ref={(c) => { this.appDrawer = c; }} />
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

export default App;
