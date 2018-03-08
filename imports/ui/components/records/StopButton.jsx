import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import IconButton from 'material-ui/IconButton';
import ContentAdd from 'material-ui/svg-icons/av/stop';
import { red700 } from 'material-ui/styles/colors';
import muiThemeable from 'material-ui/styles/muiThemeable';
import { complete } from '../../../api/records/methods.js';

const stopRecording = currentRecordId => {
  complete.call({
    id: currentRecordId,
    end: moment()
      .startOf('seconds')
      .toDate(),
  });
};

const size = 48;

/**
 * Component that stops (and completes) a record
 */
const StopButton = props => (
  <IconButton
    iconStyle={{ width: size, height: size }}
    style={{
      float: 'right',
      width: size,
      height: size,
      padding: 0,
    }}
    onTouchTap={() => {
      stopRecording(props.currentRecordId);
    }}
    disabled={!props.canStop}
  >
    <ContentAdd color={red700} />
  </IconButton>
);

StopButton.propTypes = {
  currentRecordId: PropTypes.string.isRequired,
  canStop: PropTypes.bool,
};

StopButton.defaultProps = {
  canStop: true,
};

export default muiThemeable()(StopButton);
