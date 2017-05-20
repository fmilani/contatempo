import React from 'react';
import moment from 'moment';
import { i18n } from 'meteor/universe:i18n';
import BigTimeDisplay from '../components/records/BigTimeDisplay.jsx';
import RecordsList from '../components/records/RecordsList.jsx';
import Spinner from '../components/Spinner.jsx';

/**
 * Component to display the user's history of records
 */
export default class HistoryPage extends React.Component {
  constructor(props) {
    super(props);

    // bindings
    this.getTotalElapsed = this.getTotalElapsed.bind(this);
  }

  getTotalElapsed() {
    const finishedElapsed = this.props.records
      .filter(record => record.end)
      .map(record => moment(record.end).diff(moment(record.begin)))
      .reduce((l, n) => l + n, 0);
    return finishedElapsed;
  }

  render() {
    const { loading, records } = this.props;
    return (
      <div>
        <BigTimeDisplay
          time={this.getTotalElapsed()}
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
};

HistoryPage.defaultProps = {
  loading: false,
  records: [],
};
