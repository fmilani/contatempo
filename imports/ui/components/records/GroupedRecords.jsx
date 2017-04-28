import React from 'react';
import moment from 'moment';
import 'moment-duration-format';
import { Card, CardHeader, CardText } from 'material-ui/Card';
import RecordItem from './RecordItem.jsx';

/**
 * Group records inside a Card
 *
 * @prop {Object[]} records - the time records to be shown
 * @prop {Object} records[].begin - the begin of the time record (a record time)
 * @prop {Object} records[].end - the end of the time record (a record time)
 */
export default class GroupedRecords extends React.Component {

  /**
   * Gets the total time elapsed of the completed records
   */
  getCompleteElapsed() {
    const { records } = this.props;
    return records
      .filter(record => record.end)
      .map(record => moment(record.end).diff(moment(record.begin)))
      .reduce((l, n) => l + n, 0);
  }

  render() {
    const { records } = this.props;
    return (
      <Card rounded={false}>
        <CardHeader
          title={moment(records[0].begin).calendar()}
          subtitle={moment.duration(this.getCompleteElapsed()).format('HH:mm:ss', { trim: false })}
          actAsExpander
          showExpandableButton
        />
        <CardText expandable>
          {
            records.map(record =>
              <RecordItem key={record._id} record={record} displayDay={false} />,
            )
          }
        </CardText>
      </Card>
    );
  }
}

GroupedRecords.propTypes = {
  records: React.PropTypes.arrayOf(React.PropTypes.shape({
    begin: React.PropTypes.instanceOf(Date),
    end: React.PropTypes.instanceOf(Date),
  })).isRequired,
};
