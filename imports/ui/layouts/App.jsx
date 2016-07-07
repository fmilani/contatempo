import React from 'react';
import TrackerPage from '/imports/ui/components/TrackerPage.jsx';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';

export default class App extends React.Component {

  render() {
    const { children } = this.props;

    return (
      <MuiThemeProvider>
        <div>
          <div>
            {children}
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
