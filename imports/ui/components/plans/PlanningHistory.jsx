import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import CircularProgress from 'material-ui/CircularProgress';
import { green700, grey500, red700 } from 'material-ui/styles/colors';

const renderBalance = (elapsed, plans) => {
  const plannedTimeMinutes = plans
    .map(plan => plan.plannedTimeMinutes)
    .reduce((previous, current) => previous + current, 0);
  let formattedBalance;
  let color = grey500;
  const balance = moment
    .duration(elapsed)
    .subtract(plannedTimeMinutes, 'minutes');
  formattedBalance = balance.format('HH:mm:ss', { trim: false });
  if (balance < 0) {
    color = red700;
  } else {
    color = green700;
    formattedBalance = `+${formattedBalance}`;
  }
  return <a style={{ color }}>{formattedBalance}</a>;
};

/**
 * Component that renders the balance of a list of pĺans based on a given recorded time.
 */
const PlanningHistory = props => {
  const { recordedTime, plans, loading } = props;
  if (loading) {
    return <CircularProgress size={14} thickness={2} />;
  }
  return renderBalance(recordedTime, plans);
};

PlanningHistory.propTypes = {
  recordedTime: PropTypes.number.isRequired,
  loading: PropTypes.bool.isRequired,
  plans: PropTypes.arrayOf(
    PropTypes.shape({
      plannedTimeMinutes: PropTypes.number,
    }),
  ),
};

PlanningHistory.defaultProps = {
  plans: null,
};
export default PlanningHistory;
