import React from 'react';
import { Meteor } from 'meteor/meteor';
import { edit } from '../../../api/records/methods.js';
import { i18n } from 'meteor/universe:i18n';
import moment from 'moment';
import DatePicker from 'material-ui/DatePicker';
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

  editRecord(newDate, field) {
    const { record, type } = this.props;
    const newDateMoment = moment(newDate);
    let date = newDate;
    if (field === 'date') {
      // because material-ui's DatePicker set the time to 00:00 when changing
      // date, we need to explicitly set only the date of the record
      date = moment(record[type]).set({
        date: newDateMoment.get('date'),
        month: newDateMoment.get('month'),
        year: newDateMoment.get('year'),
      }).toDate();
    }

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
            (<div
              style={{
                display: 'flex', alignItems: 'center',
                justifyContent: this.props.type === 'begin' ? 'flex-start' : 'flex-end',
              }}
            >
              <DatePicker
                style={{ flex: '0 0 40%' }}
                name="recordDate"
                textFieldStyle={{ width: '100%' }}
                inputStyle={{ textAlign: 'center', fontSize: '12px' }}
                underlineShow={false}
                DateTimeFormat={Intl.DateTimeFormat}
                locale={i18n.getLocale()}
                value={recordTime}
                onChange={(event, date) => { this.editRecord(date, 'date'); }}
                formatDate={(date) => moment(date).format('DD/MM')}
              />
              <TimePicker
                style={{ flex: '0 0 40%' }}
                ref="timePicker"
                textFieldStyle={{ width: '100%' }}
                inputStyle={{ textAlign: 'center', fontSize: '16px' }}
                underlineShow={false}
                format="24hr"
                name="recordTime"
                value={recordTime}
                onChange={(event, date) => { this.editRecord(date); }}
              />
            </div>) :
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
