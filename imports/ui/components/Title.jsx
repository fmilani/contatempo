import React from 'react';
import muiThemeable from 'material-ui/styles/muiThemeable';

const Title = props => (
  <div
    style={{
      fontFamily: props.muiTheme.fontFamily,
      fontSize: '16px',
      color: props.muiTheme.palette.textColor,
      padding: '20px 0px',
    }}
  >
    {props.title}
  </div>
);

Title.propTypes = {
  muiTheme: React.PropTypes.object,
  title: React.PropTypes.string,
};

export default muiThemeable()(Title);
