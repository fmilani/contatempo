import React from 'react';
import { List } from 'material-ui/List';
import Subheader from 'material-ui/Subheader';
import RecordItem from './RecordItem.jsx';
import EmptyRecordsList from './EmptyRecordsList.jsx';

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

    return (
      <List style={{ marginTop: '10px' }}>
        <Subheader style={{ fontSize: '16px' }}>{this.props.title}</Subheader>
        {records.map((record, index) => (
          <RecordItem key={index} record={record} />
        ))}
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
  title: React.PropTypes.string.isRequired,
  records: React.PropTypes.array,
};
