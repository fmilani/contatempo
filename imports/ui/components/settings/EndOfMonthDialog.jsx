import React from 'react';
import PropTypes from 'prop-types';
import { RadioButton, RadioButtonGroup } from 'material-ui/RadioButton';
import FlatButton from 'material-ui/FlatButton';
import Dialog from 'material-ui/Dialog';
import { i18n } from 'meteor/universe:i18n';
import EndOfMonthEnum from '../../../api/settings/EndOfMonthEnum';

const style = {
  marginBottom: 16,
};

const EndOfMonthDialog = props => (
  <Dialog
    title="Fim do mês"
    actions={[
      <FlatButton label="Cancel" primary onTouchTap={props.onCancelClick} />,
    ]}
    modal={false}
    open={props.open}
    onRequestClose={props.onRequestClose}
  >
    <RadioButtonGroup
      name="endOfMonth"
      valueSelected={props.endOfMonth}
      onChange={props.onChange}
    >
      <RadioButton
        value={EndOfMonthEnum.LAST_DAY}
        label={i18n.getTranslation('settings.last_day')}
        style={style}
      />
      <RadioButton
        value={EndOfMonthEnum.DAY_20}
        label={i18n.getTranslation('settings.day_20')}
        style={style}
      />
    </RadioButtonGroup>
  </Dialog>
);

EndOfMonthDialog.propTypes = {
  open: PropTypes.bool.isRequired,
};

export default EndOfMonthDialog;
