import React from 'react';
import { List } from 'material-ui/List';
import Paper from 'material-ui/Paper';
import moment from 'moment';
import RecordItem from './RecordItem.jsx';
import EmptyRecordsList from './EmptyRecordsList.jsx';
import Title from '../Title.jsx';

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
      // the marginBottom on the list is due to the RecordAdd's FAB
      // so the user can see the last item of the list
      <List style={{ marginBottom: '50px' }}>
        {records.map((record, index) => {
          // check if current record's day is the same of previous one to hide the day of the record
          if (index > 0 &&
            moment(record.begin).startOf('day')
              .isSame(moment(records[index - 1].begin).startOf('day'))) {
            displayDay = false;
          } else {
            displayDay = true;
          }

          return (
            <div key={index}>
              {displayDay ? <Title title={moment(record.begin).calendar()} /> : null}
              <Paper rounded={false} style={{ marginBottom: '15px' }}>
                <RecordItem record={record} displayDay={false} />
              </Paper>
            </div>
          );
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
