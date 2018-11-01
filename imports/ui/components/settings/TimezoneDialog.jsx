import React from 'react';
import PropTypes from 'prop-types';
import { i18n } from 'meteor/universe:i18n';
import moment from 'moment-timezone';
import AutoComplete from 'material-ui/AutoComplete';
import FlatButton from 'material-ui/FlatButton';
import Dialog from 'material-ui/Dialog';

const TimezoneDialog = props => (
  <Dialog
    title={i18n.getTranslation('settings.timezone')}
    actions={[
      <FlatButton label="Cancel" primary onTouchTap={props.onCancelClick} />,
    ]}
    modal={false}
    open={props.open}
    onRequestClose={props.onRequestClose}
  >
    <AutoComplete
      fullWidth
      floatingLabelText={i18n.getTranslation('settings.timezone')}
      hintText={i18n.getTranslation('settings.timezone_hint')}
      filter={AutoComplete.fuzzyFilter}
      dataSource={moment.tz.names().map(tzName => ({
        text: `${tzName.replace(/_/g, ' ').replace(/\//g, ' - ')}`,
        value: tzName,
      }))}
      maxSearchResults={5}
      onNewRequest={props.onChange}
      onUpdateInput={props.onUpdateInput}
      searchText={props.timezone.text.replace(/_/g, ' ').replace(/\//g, ' - ')}
    />
  </Dialog>
);

TimezoneDialog.propTypes = {
  open: PropTypes.bool.isRequired,
};

export default TimezoneDialog;
