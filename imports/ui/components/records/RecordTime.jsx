import React from 'react';
import { edit } from '../../../api/records/methods.js';
import { i18n } from 'meteor/universe:i18n';
import moment from 'moment';
import DatePicker from 'material-ui/DatePicker';
import Snackbar from 'material-ui/Snackbar';
import TimePicker from 'material-ui/TimePicker';
import ImageTimer from 'material-ui/svg-icons/image/timer';
import { isValidEdition } from '../../../api/records/helpers';

/**
 * Component to show (and edit) a single record time (whether it's its begin or end time)
 */
export default class RecordTime extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      errorOnEdition: false,
    };
    // bindings
    this.getValue = this.getValue.bind(this);
    this.editRecord = this.editRecord.bind(this);
    this.showErrorOnEdition = this.showErrorOnEdition.bind(this);
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

    const errorOnEdition = !isValidEdition(record, date, type);
    if (errorOnEdition) {
      this.showErrorOnEdition(record, type);
    }
    edit.call({
      id: record._id,
      field: type,
      date,
    }, (error) => {
      if (error) {
        if (error.error === 'records.edit.endMustBeAfterBegin') {
          this.showErrorOnEdition(record, type);
        } else {
          // unexpected error. TODO: handle properly (and add logs)
          throw new Error('Unexpected error');
        }
      }
    });
  }

  showErrorOnEdition(record, type) {
    // if error, set the state value errorOnEdition so the Snackbar is shown
    this.setState({ errorOnEdition: true });
    // for some reason, the timepicker still changes its value to the invalid
    // one so we need to restore it
    this.refs.timePicker.setState({ time: record[type] });
    // throw an error so timepicker and datepicker don't dismiss
    throw new Error('Cannot edit record\'s end to a time before its begin');
  }

  render() {
    const recordTime = this.getValue();
    return (
      <div style={{ flex: '0 0 40%' }}>
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
                formatDate={date => moment(date).format('DD/MM')}
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
            (<div style={{ textAlign: 'center' }}>
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
        <Snackbar
          open={this.state.errorOnEdition}
          message={i18n.getTranslation('records.errorOnDatesMsg')}
          autoHideDuration={4000}
          onRequestClose={() => { this.setState({ errorOnEdition: false }); }}
        />
      </div>
    );
  }
}

RecordTime.propTypes = {
  type: React.PropTypes.oneOf(['begin', 'end']).isRequired,
  record: React.PropTypes.object,
};
