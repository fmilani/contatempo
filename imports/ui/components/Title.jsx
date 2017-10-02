import React from 'react';
import PropTypes from 'prop-types';
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
  muiTheme: PropTypes.object,
  title: PropTypes.string,
};

export default muiThemeable()(Title);
