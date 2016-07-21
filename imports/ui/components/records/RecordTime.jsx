import React from 'react';
import { Meteor } from 'meteor/meteor';
import { edit } from '../../../api/records/methods.js';
import moment from 'moment';
import TimePicker from 'material-ui/TimePicker';
import ImageTimer from 'material-ui/svg-icons/image/timer';

/**
 * Component to show (and edit) a single record time (whether it's its begin or end time)
 */
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
    const recordTime = this.getValue();
    return (
      <div style={{ flex: '0 0 40%', textAlign: 'center' }}>
        {
          recordTime ?
            (<TimePicker
              ref="timePicker"
              textFieldStyle={{ width: '100%' }}
              inputStyle={{ textAlign: 'center', fontSize: '13px' }}
              underlineShow={false}
              format="24hr"
              name="recordTime"
              value={recordTime}
              onChange={(event, date) => { this.editRecord(date); }}
            />) :
            (<div>
              <i
                style={{
                  verticalAlign: 'middle',
                  display: 'inline-block',
                  height: '48px', // TODO: this height cant be fixed. (check texfield input height)
                }}
              />
              <div style={{ verticalAlign: 'middle', display: 'inline-block' }}>
                <ImageTimer style={{ width: '14px', height: '14px' }} />
              </div>
            </div>)
        }
      </div>
    );
  }
}

RecordTime.propTypes = {
  type: React.PropTypes.oneOf(['begin', 'end']).isRequired,
  record: React.PropTypes.object,
};
