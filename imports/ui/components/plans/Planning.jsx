import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import { i18n } from 'meteor/universe:i18n';
import CircularProgress from 'material-ui/CircularProgress';
import { green700, grey500, red700 } from 'material-ui/styles/colors';

import PlanningEditDialog from './PlanningEditDialog.jsx';

class Planning extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      editModalOpen: false,
    };
  }

  closeEditModal = () => {
    this.setState(() => ({ editModalOpen: false }));
  };

  openEditModal = () => {
    this.setState(() => ({ editModalOpen: true }));
  };

  renderBalance(elapsed, plans) {
    let formattedBalance;
    let color = grey500;
    const balance = moment
      .duration(elapsed)
      .subtract(plans ? plans.plannedTimeMinutes : 0, 'minutes');
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

  renderTouchToAddPlan() {
    return (
      <a
        style={{ color: grey500, fontStyle: 'italic' }}
        onTouchTap={event => {
          event.stopPropagation();
          this.openEditModal();
        }}
      >
        {`(${i18n.getTranslation('planning.touchToPlanThisDay')})`}
      </a>
    );
  }

  render() {
    const { elapsed, plans, loading } = this.props;
    if (loading) {
      return <CircularProgress size={14} thickness={2} />;
    }
    return (
      <div>
        {plans
          ? this.renderBalance(elapsed, plans)
          : this.renderTouchToAddPlan()}
        <PlanningEditDialog
          day={this.props.day}
          open={this.state.editModalOpen}
          closeModal={this.closeEditModal}
          plan={plans}
        />
      </div>
    );
  }
}

Planning.propTypes = {
  day: PropTypes.string.isRequired,
  elapsed: PropTypes.number.isRequired,
  loading: PropTypes.bool.isRequired,
  plans: PropTypes.shape({
    plannedTimeMinutes: PropTypes.number,
  }),
};

Planning.defaultProps = {
  plans: null,
};
export default Planning;
