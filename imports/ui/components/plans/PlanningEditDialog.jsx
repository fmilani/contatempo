import React from 'react';
import PropTypes from 'prop-types';
import { i18n } from 'meteor/universe:i18n';
import Dialog from 'material-ui/Dialog';
import TextField from 'material-ui/TextField';
import FlatButton from 'material-ui/FlatButton';
import Snackbar from 'material-ui/Snackbar';
import muiThemeable from 'material-ui/styles/muiThemeable';

import { insert } from '../../../api/plans/methods.js';

class PlanningEditDialog extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      editModalOpen: props.open,
      errorOnEdition: false,
      plannedHours: props.plan
        ? Math.floor(props.plan.plannedTimeMinutes / 60)
        : 0,
      plannedMinutes: props.plan ? props.plan.plannedTimeMinutes % 60 : 0,
    };
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      editModalOpen: nextProps.open,
    });
  }

  onKeyDownOnFields = event => {
    if (event.key === 'Enter') {
      this.editPlanning();
    }
  };

  editPlanning = () => {
    const plannedTimeMinutes =
      Number(this.state.plannedHours) * 60 + Number(this.state.plannedMinutes);
    if (plannedTimeMinutes <= 0) {
      this.setState(() => ({ errorOnEdition: true }));
      return;
    }
    insert.call(
      {
        day: this.props.day,
        plannedTimeMinutes,
      },
      error => {
        if (error) {
          // unexpected error. TODO: handle properly (and add logs)
          throw new Error(error);
        }
      },
    );
    this.props.closeModal();
  };

  handlePlannedHoursChange = event => {
    this.setState({
      plannedHours: event.target.value,
    });
  };

  handlePlannedMinutesChange = event => {
    this.setState({
      plannedMinutes: event.target.value,
    });
  };

  render() {
    return (
      <div>
        <Dialog
          title={i18n.getTranslation('planning.planTheDay')}
          actions={[
            <FlatButton
              label={i18n.getTranslation('common.cancel')}
              onTouchTap={this.props.closeModal}
            />,
            <FlatButton
              type="submit"
              label={i18n.getTranslation('common.confirm')}
              primary
              onTouchTap={this.editPlanning}
            />,
          ]}
          modal={false}
          open={this.state.editModalOpen}
          onRequestClose={this.props.closeModal}
        >
          <TextField
            type="Number"
            fullWidth
            value={this.state.plannedHours}
            onChange={this.handlePlannedHoursChange}
            floatingLabelText={i18n.getTranslation('common.hours')}
            onKeyDown={this.onKeyDownOnFields}
          />
          <TextField
            type="Number"
            fullWidth
            value={this.state.plannedMinutes}
            onChange={this.handlePlannedMinutesChange}
            floatingLabelText={i18n.getTranslation('common.minutes')}
            onKeyDown={this.onKeyDownOnFields}
          />
        </Dialog>
        <Snackbar
          open={this.state.errorOnEdition}
          message={i18n.getTranslation('planning.errorOnEditionMsg')}
          autoHideDuration={4000}
          onRequestClose={() => {
            this.setState({ errorOnEdition: false });
          }}
          style={{
            bottom: this.props.muiTheme.bottomNavigation.height,
          }}
        />
      </div>
    );
  }
}

PlanningEditDialog.propTypes = {
  closeModal: PropTypes.func.isRequired,
  day: PropTypes.string.isRequired,
  open: PropTypes.bool.isRequired,
  plan: PropTypes.shape({
    plannedTimeMinutes: PropTypes.number,
  }),
  muiTheme: PropTypes.shape({
    bottomNavigation: PropTypes.object,
  }).isRequired,
};

PlanningEditDialog.defaultProps = {
  plan: {
    plannedTimeMinutes: 0,
  },
};

export default muiThemeable()(PlanningEditDialog);
