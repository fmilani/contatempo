import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import 'moment-duration-format';
import { Card, CardHeader, CardText } from 'material-ui/Card';
import withTimer from '../../hocs/withTimer';
import RecordItem from './RecordItem.jsx';
import PlanningContainer from '../../../containers/PlanningContainer.jsx';

/**
 * Group records inside a Card
 *
 * @prop {Object[]} records - the time records to be shown
 * @prop {Object} records[].begin - the begin of the time record (a record time)
 * @prop {Object} records[].end - the end of the time record (a record time)
 */
class GroupedRecords extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }
  componentDidMount() {
    const ongoingRecord = this.props.records.filter(record => !record.end)[0];
    if (ongoingRecord) {
      this.props.startTimer();
    }
  }

  componentWillUpdate(nextProps) {
    const ongoingRecord = nextProps.records.filter(record => !record.end)[0];
    if (!ongoingRecord) {
      this.props.stopTimer();
    }
  }

  componentWillUnmount() {
    this.props.stopTimer();
  }

  /**
   * Gets the total time elapsed of the completed records
   */
  getCompleteElapsed() {
    const { now, records } = this.props;

    const ongoingRecord = records.filter(record => !record.end)[0];
    const ongoingTime = ongoingRecord
      ? moment(now)
          .startOf('seconds')
          .diff(ongoingRecord.begin)
      : 0;

    const completedTime = records
      .filter(record => record.end)
      .map(record => moment(record.end).diff(moment(record.begin)))
      .reduce((l, n) => l + n, 0);

    return ongoingTime + completedTime;
  }

  render() {
    const { records } = this.props;
    const day = moment(records[0].begin).format('YYYY-MM-DD');

    return (
      <div>
        <Card rounded={false}>
          <CardHeader
            title={moment(records[0].begin).calendar()}
            subtitle={moment
              .duration(this.getCompleteElapsed())
              .format('HH:mm:ss', { trim: false })}
            actAsExpander
            showExpandableButton
          >
            <div style={{ fontSize: '14px' }}>
              <PlanningContainer
                elapsed={this.getCompleteElapsed()}
                day={day}
              />
            </div>
          </CardHeader>
          <CardText expandable>
            {records.map(record => (
              <RecordItem key={record._id} record={record} displayDay={false} />
            ))}
          </CardText>
        </Card>
      </div>
    );
  }
}

GroupedRecords.propTypes = {
  records: PropTypes.arrayOf(
    PropTypes.shape({
      begin: PropTypes.instanceOf(Date),
      end: PropTypes.instanceOf(Date),
    }),
  ).isRequired,
  now: PropTypes.shape().isRequired,
  startTimer: PropTypes.func.isRequired,
  stopTimer: PropTypes.func.isRequired,
};

export default withTimer(GroupedRecords);
