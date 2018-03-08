import React from 'react';
import PropTypes from 'prop-types';
import Paper from 'material-ui/Paper';
import FormattedTime from './FormattedTime.jsx';
import PlanningHistoryContainer from '../../../containers/PlanningHistoryContainer.jsx';

/**
 * Component used to display a big card with a formatted time
 */
const BigTimeDisplay = props => {
  const { time, dayFrom, dayTo } = props;

  return (
    <Paper style={{ padding: '20px 16px', textAlign: 'center' }}>
      <div>{props.title}:</div>
      <FormattedTime time={time} size={28} />
      {dayFrom ? (
        <PlanningHistoryContainer
          dayFrom={dayFrom}
          dayTo={dayTo}
          recordedTime={time}
        />
      ) : null}
    </Paper>
  );
};

BigTimeDisplay.propTypes = {
  dayFrom: PropTypes.string,
  dayTo: PropTypes.string,
  time: PropTypes.number,
  title: PropTypes.string.isRequired,
};

BigTimeDisplay.defaultProps = {
  time: 0,
  dayFrom: null,
  dayTo: null,
};

export default BigTimeDisplay;
