import React from 'react';
import { Meteor } from 'meteor/meteor';
import { edit } from '../../../api/records/methods.js';
import moment from 'moment';
import TimePicker from 'material-ui/TimePicker';

export default class RecordTime extends React.Component {

  constructor(props) {
    super(props);

    // bindings
    this.getValue = this.getValue.bind(this);
    this.editRecord = this.editRecord.bind(this);
  }

  getValue() {
    const { type, record } = this.props;

    return type === 'begin' ? record.begin : record.end;
  }

  editRecord(date) {
    const { record, type } = this.props;

    if (type === 'begin') {
      // TODO: refactor this verification as it is the same one in the server
      if (moment(date).isAfter(moment(record.end))) {
        this.refs.timePicker.setState({ time: record[type] });
        throw new Meteor.Error('records.edit.beginAfterEnd',
          'Cannot edit record\'s begin to a time after its end');
      }
    } else {
      if (moment(date).isBefore(moment(record.begin))) {
        this.refs.timePicker.setState({ time: record[type] });
        throw new Meteor.Error('records.edit.endBeforeBegin',
        'Cannot edit record\'s end to a time before its begin');
      }
    }
    edit.call({
      id: record._id,
      field: type,
      date,
    });
  }

  render() {
    return (
      <div style={{ flex: '0 0 40%', textAlign: 'center' }}>
        <TimePicker
          ref="timePicker"
          textFieldStyle={{ width: '100%' }}
          inputStyle={{ textAlign: 'center', fontSize: '13px' }}
          underlineShow={false}
          format="24hr"
          name="recordTime"
          value={this.getValue()}
          onChange={(event, date) => { this.editRecord(date); }}
        />
      </div>
    );
  }
}

RecordTime.propTypes = {
  type: React.PropTypes.oneOf(['begin', 'end']).isRequired,
  record: React.PropTypes.object,
};
