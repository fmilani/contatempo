import React from 'react';
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';
import RaisedButton from 'material-ui/RaisedButton';
import moment from 'moment';
import DatePicker from 'material-ui/DatePicker';
import TimePicker from 'material-ui/TimePicker';
import { insert } from '../../../api/records/methods.js';
import { i18n } from 'meteor/universe:i18n';

// the desired precision (any unit below this will be zero)
const PRECISION = 'seconds';

/**
 * Component to add a record manually.
 */
export default class RecordAdd extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      open: false,
    };

    this.t = i18n.createTranslator('records');
    // bindings
    this.handleOpen = this.handleOpen.bind(this);
    this.handleClose = this.handleClose.bind(this);
    this.addRecord = this.addRecord.bind(this);
  }

  addRecord() {
    const date = moment(this.refs.date.state.date);
    const begin = moment(this.refs.beginTime.state.time)
      .year(date.year())
      .month(date.month())
      .date(date.date())
      .startOf(PRECISION)
      .toDate();
    const end = moment(this.refs.endTime.state.time)
      .year(date.year())
      .month(date.month())
      .date(date.date())
      .startOf(PRECISION)
      .toDate();

    insert.call({
      begin,
      end,
    });

    this.handleClose();
  }

  handleOpen() {
    this.setState({ open: true });
  }

  handleClose() {
    this.setState({ open: false });
  }

  render() {
    const actions = [
      <FlatButton
        label={i18n.getTranslation('common.cancel')}
        onTouchTap={this.handleClose}
      />,
      <FlatButton
        label={this.t('add_submit')}
        primary
        onTouchTap={this.addRecord}
      />,
    ];

    return (
      <div>
        <RaisedButton
          style={{ width: '100%' }}
          label={this.t('add_button_label')}
          onTouchTap={this.handleOpen}
        />
        <Dialog
          title={this.t('add_title')}
          actions={actions}
          modal={false}
          open={this.state.open}
          onRequestClose={this.handleClose}
        >
          <DatePicker
            ref="date"
            hintText={this.t('day')}
            textFieldStyle={{ width: '100%' }}
          />
          <TimePicker
            ref="beginTime"
            hintText={this.t('begin')}
            textFieldStyle={{ width: '100%' }}
            format="24hr"
            name="recordTime"
          />
          <TimePicker
            ref="endTime"
            hintText={this.t('end')}
            textFieldStyle={{ width: '100%' }}
            format="24hr"
            name="recordTime"
          />
        </Dialog>
      </div>
    );
  }
}
