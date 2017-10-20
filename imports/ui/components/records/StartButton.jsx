import React from 'react';
import moment from 'moment';
import IconButton from 'material-ui/IconButton';
import PlayIcon from 'material-ui/svg-icons/av/play-arrow';
import { green700 } from 'material-ui/styles/colors';
import muiThemeable from 'material-ui/styles/muiThemeable';
import { insert } from '../../../api/records/methods.js';

const startRecording = () => {
  insert.call({
    begin: moment()
      .startOf('seconds')
      .toDate(),
    end: null,
  });
};
const size = 48;

/**
 * Component that starts a record
 */
const StartButton = () => (
  <IconButton
    iconStyle={{ width: size, height: size }}
    style={{
      float: 'right',
      width: size,
      height: size,
      padding: 0,
    }}
    onTouchTap={startRecording}
  >
    <PlayIcon color={green700} />
  </IconButton>
);

export default muiThemeable()(StartButton);
