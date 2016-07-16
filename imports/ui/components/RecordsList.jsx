import { Meteor } from 'meteor/meteor';
import React from 'react';
import moment from 'moment';
import { i18n } from 'meteor/universe:i18n';
import TimePicker from 'material-ui/TimePicker';
import { List } from 'material-ui/List';
import IconButton from 'material-ui/IconButton';
import ActionDelete from 'material-ui/svg-icons/action/delete';
import Divider from 'material-ui/Divider';
import { edit, remove } from '../../api/records/methods.js';

/**
 * Shows time records in a table (yes, not a list).
 *
 * @prop {Object[]} records - the time records to be shown
 * @prop {Object} records[].begin - the begin of the time record (a record time)
 * @prop {Object} records[].end - the end of the time record (a record time)
 */
export default class RecordsList extends React.Component {

  constructor(props) {
    super(props);

    this.t = i18n.createTranslator('records');
    this.editRecord = this.editRecord.bind(this);
  }

  // formats a record time with the hours, minutes and seconds (HH:mm:ss)
  formatRecordTime(recordTime) {
    return recordTime ? moment(recordTime).format('HH:mm:ss') : '...';
  }

  editRecord(record, field, date) {
    if (field === 'begin') {
      // TODO: refactor this verification as it is the same one in the server
      if (moment(date).isAfter(moment(record.end))) {
        this.refs[`${record._id}_${field}`].setState({ time: record[field] });
        throw new Meteor.Error('records.edit.beginAfterEnd',
          'Cannot edit record\'s begin to a time after its end');
      }
    } else {
      if (moment(date).isBefore(moment(record.begin))) {
        this.refs[`${record._id}_${field}`].setState({ time: record[field] });
        throw new Meteor.Error('records.edit.endBeforeBegin',
        'Cannot edit record\'s end to a time before its begin');
      }
    }
    edit.call({
      id: record._id,
      field,
      date,
    });
  }

  removeRecord(id) {
    remove.call({ id });
  }

  render() {
    const grey500 = '#9E9E9E'; // TODO: use palette (grey500)
    return (
      <div>
        <List>
          <div style={{ display: 'flex', margin: '15px 0px', color: grey500, fontSize: '12px' }}>
            <div style={{ flex: '0 0 40%', textAlign: 'center' }}>
              {this.t('begin')}
            </div>
            <div style={{ flex: '0 0 40%', textAlign: 'center' }}>
              {this.t('end')}
            </div>
          </div>
            {this.props.records.map((record, index) => (
              <div key={index}>
                <Divider />
                <div style={{ display: 'flex' }}>
                  <div style={{ flex: '0 0 40%', textAlign: 'center' }}>
                    <TimePicker
                      ref={`${record._id}_begin`}
                      textFieldStyle={{ width: '100%' }}
                      inputStyle={{ textAlign: 'center', fontSize: '13px' }}
                      underlineShow={false}
                      format="24hr"
                      name="recordTime"
                      value={record.begin}
                      onChange={(event, date) => { this.editRecord(record, 'begin', date); }}
                    />
                  </div>
                  <div style={{ flex: '0 0 40%', textAlign: 'center' }}>
                    <TimePicker
                      ref={`${record._id}_end`}
                      textFieldStyle={{ width: '100%' }}
                      inputStyle={{ textAlign: 'center', fontSize: '13px' }}
                      underlineShow={false}
                      format="24hr"
                      name="recordTime"
                      value={record.end}
                      onChange={(event, date) => { this.editRecord(record, 'end', date); }}
                    />
                  </div>
                  <div style={{ flex: '0 0 20%', textAlign: 'center' }}>
                    <IconButton
                      onClick={() => { this.removeRecord(record._id); }}
                      iconStyle={{ color: grey500, width: '20px', height: '20px' }}
                    >
                      <ActionDelete />
                    </IconButton>
                  </div>
                </div>
              </div>
            ))}
        </List>
      </div>
    );
  }
}

RecordsList.propTypes = {
  records: React.PropTypes.array,
};
