import React from 'react';
import PropTypes from 'prop-types';
import Paper from 'material-ui/Paper';
import FormattedTime from './FormattedTime.jsx';

/**
 * Component used to display a big card with a formatted time
 */
const BigTimeDisplay = props => {
  const { time } = props;

  return (
    <Paper style={{ padding: '20px 16px', textAlign: 'center' }}>
      <div>{props.title}:</div>
      <FormattedTime time={time} size={28} />
    </Paper>
  );
};

BigTimeDisplay.propTypes = {
  time: PropTypes.number,
  title: PropTypes.string.isRequired,
};

BigTimeDisplay.defaultProps = {
  time: 0,
};

export default BigTimeDisplay;
