import React from 'react';
import { i18n } from 'meteor/universe:i18n';
import Dialog from 'material-ui/Dialog';
import TextField from 'material-ui/TextField';
import FlatButton from 'material-ui/FlatButton';

class PlanningEditDialog extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      editModalOpen: false,
      plannedHours: 0,
      plannedMinutes: 0,
    };
  }
  render() {
    return (
      <Dialog
        title={i18n.getTranslation('planning.planTheDay')}
        actions={[
          <FlatButton
            label={i18n.getTranslation('common.cancel')}
            onTouchTap={this.closeEditModal}
          />,
          <FlatButton
            label={i18n.getTranslation('common.confirm')}
            primary
            onTouchTap={this.editPlanning}
          />,
        ]}
        modal={false}
        open={this.state.editModalOpen}
        onRequestClose={this.closeEditModal}
      >
        <TextField
          type="Number"
          value={this.state.plannedHours}
          onChange={this.handlePlannedHoursChange}
          floatingLabelText="Horas"
        />
        <TextField
          type="Number"
          value={this.state.plannedMinutes}
          onChange={this.handlePlannedMinutesChange}
          floatingLabelText="Minutos"
        />
      </Dialog>
    );
  }
}

export default PlanningEditDialog;
