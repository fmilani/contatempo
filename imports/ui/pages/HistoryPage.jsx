import React from 'react';
import { i18n } from 'meteor/universe:i18n';
import BigTimeDisplay from '../components/records/BigTimeDisplay.jsx';
import RecordsList from '../components/records/RecordsList.jsx';
import Spinner from '../components/Spinner.jsx';
import { getTotalElapsedTime } from '../../api/helpers/date-helpers';
import withTimer from '../hocs/withTimer.js';

/**
 * Component to display the user's history of records
 */
class HistoryPage extends React.Component {
  componentDidMount() {
    const ongoingRecord = this.props.records.filter(record => !record.end)[0];
    if (ongoingRecord) {
      this.props.startTimer();
    }
  }

  componentWillReceiveProps(nextProps) {
    const ongoingRecord = nextProps.records.filter(record => !record.end)[0];
    if (ongoingRecord) {
      this.props.startTimer();
    } else {
      this.props.stopTimer();
    }
  }

  componentWillUnmount() {
    this.props.stopTimer();
  }

  render() {
    const { loading, records, now } = this.props;
    return (
      <div>
        <BigTimeDisplay
          time={getTotalElapsedTime(records, now)}
          title={i18n.getTranslation('common.total')}
        />
        <div style={{ marginTop: 15 }}>
          {loading ? <Spinner /> : <RecordsList records={records} />}
        </div>
      </div>
    );
  }
}

HistoryPage.propTypes = {
  loading: React.PropTypes.bool,
  records: React.PropTypes.arrayOf(
    React.PropTypes.shape({
      begin: React.PropTypes.instanceOf(Date),
      end: React.PropTypes.instanceOf(Date),
    }),
  ),
  now: React.PropTypes.shape().isRequired,
  startTimer: React.PropTypes.func.isRequired,
  stopTimer: React.PropTypes.func.isRequired,
};

HistoryPage.defaultProps = {
  loading: false,
  records: [],
};

export default withTimer(HistoryPage);
