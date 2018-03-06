import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import CircularProgress from 'material-ui/CircularProgress';
import { green700, grey500, red700 } from 'material-ui/styles/colors';

class PlanningHistory extends React.Component {
  renderBalance(elapsed, plans) {
    const plannedTime = plans
      .map(plan => plan.plannedTime)
      .reduce((previous, current) => previous + current, 0);
    let formattedBalance;
    let color = grey500;
    const balance = moment.duration(elapsed).subtract(plannedTime, 'hours');
    formattedBalance = balance.format('HH:mm:ss', { trim: false });
    if (balance < 0) {
      color = red700;
    } else {
      color = green700;
      formattedBalance = `+${formattedBalance}`;
    }
    return (
      <a
        style={{ color }}
        onTouchTap={event => {
          event.stopPropagation();
          this.openEditModal();
        }}
      >
        {formattedBalance}
      </a>
    );
  }
  render() {
    const { elapsed, plans, loading } = this.props;
    if (loading) {
      return <CircularProgress size={14} thickness={2} />;
    }
    return this.renderBalance(elapsed, plans);
  }
}

PlanningHistory.propTypes = {
  elapsed: PropTypes.number.isRequired,
  loading: PropTypes.bool.isRequired,
  plans: PropTypes.arrayOf(
    PropTypes.shape({
      plannedTime: PropTypes.number,
    }),
  ),
};

PlanningHistory.defaultProps = {
  plans: null,
};
export default PlanningHistory;
