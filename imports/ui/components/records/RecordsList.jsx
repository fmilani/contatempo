import React from 'react';
import { List } from 'material-ui/List';
import RecordItem from './RecordItem.jsx';
import EmptyRecordsList from './EmptyRecordsList.jsx';
import moment from 'moment';

/**
 * Shows time records in a list.
 *
 * @prop {Object[]} records - the time records to be shown
 * @prop {Object} records[].begin - the begin of the time record (a record time)
 * @prop {Object} records[].end - the end of the time record (a record time)
 */
export default class RecordsList extends React.Component {

  renderRecordsList() {
    const { records } = this.props;
    let displayDay;
    return (
      <List style={{ marginTop: '10px' }}>
        {records.map((record, index) => {
          // check if current record's day is the same of previous one to hide the day of the record
          if (index > 0 &&
            moment(record.begin).startOf('day')
              .isSame(moment(records[index - 1].begin).startOf('day'))) {
            displayDay = false;
          } else {
            displayDay = true;
          }

          return (<RecordItem key={index} record={record} displayDay={displayDay} />);
        })}
      </List>
    );
  }

  render() {
    const { records } = this.props;
    return (
      <div>
        {
          records.length > 0
            ? this.renderRecordsList()
            : <EmptyRecordsList />
        }
      </div>
    );
  }
}

RecordsList.propTypes = {
  records: React.PropTypes.array,
};
