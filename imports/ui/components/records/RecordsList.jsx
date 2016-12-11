import React from 'react';
import { List } from 'material-ui/List';
import moment from 'moment';
import EmptyRecordsList from './EmptyRecordsList.jsx';
import GroupedRecords from './GroupedRecords.jsx';
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
    const groupedRecords = [];

    let length;
    records.forEach((record, index) => {
      if (index > 0 &&
        moment(record.begin).startOf('day')
          .isSame(moment(records[index - 1].begin).startOf('day'))) {
        groupedRecords[length - 1].push(record);
      } else {
        length = groupedRecords.push([]);
        groupedRecords[length - 1].push(record);
      }
    });

    return (
      // the margin on bottom on the list is due to the RecordAdd's FAB
      // so the user can see the last item of the list
      <List style={{ margin: '15px 0px 70px' }}>
        {
          groupedRecords.map((sameDayRecords, index) =>
            <div key={index}>
              <GroupedRecords records={sameDayRecords} />
            </div>,
          )
        }
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
  records: React.PropTypes.arrayOf(React.PropTypes.shape({
    begin: React.PropTypes.instanceOf(Date),
    end: React.PropTypes.instanceOf(Date),
  })),
};
