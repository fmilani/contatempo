import React from 'react';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';

const App = (props) => (
  <MuiThemeProvider>
    <div>
      <div>
        {props.children}
      </div>
    </div>
  </MuiThemeProvider>
);

App.propTypes = {
  children: React.PropTypes.element,
};

App.contextTypes = {
  router: React.PropTypes.object,
};

export default App;
