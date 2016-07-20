import React from 'react';
import moment from 'moment';
import { i18n } from 'meteor/universe:i18n';
import ElapsedTimeDisplay from './ElapsedTimeDisplay.jsx';
import RaisedButton from 'material-ui/RaisedButton';
import Loading from 'react-loading';
import { green700, red700 } from 'material-ui/styles/colors';
import RecordsListContainer from '../../containers/RecordsListContainer.jsx';
import RecordAdd from './records/RecordAdd.jsx';
import { insert, complete } from '../../api/records/methods.js';

// the minimum time to record, in milliseconds
// (blocks the stop button until this amount has elapsed)
const MINIMUM = 1000;

// the desired precision (any unit below this will be zero)
const PRECISION = 'seconds';

export default class TrackerPage extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      timer: undefined,
      now: moment(),
    };

    // bindings
    this.tick = this.tick.bind(this);
    this.handleClick = this.handleClick.bind(this);
    this.getButtonLabel = this.getButtonLabel.bind(this);
    this.getButtonColor = this.getButtonColor.bind(this);
    this.pastMinimum = this.pastMinimum.bind(this);
    this.getTotalElapsed = this.getTotalElapsed.bind(this);
    this.renderPage = this.renderPage.bind(this);
  }

  componentDidMount() {
    // TODO: This is NOT ideal. the clock start ticking right away to cover the case where
    // the clock is running when the component is mounted (i.e.: there is an incompleteRecord).
    // The right way would be to wait for the subscription to be ready so we can check if the clock
    // is runing
    const timer = setInterval(this.tick, 33);
    this.setState({ timer });
  }

  componentWillUnmount() {
    clearInterval(this.state.timer);
    this.setState({ timer: undefined });
  }

  getButtonLabel() {
    return i18n.getTranslation(this.props.running ? 'tracker_page.stop' : 'tracker_page.start');
  }

  getButtonColor() {
    return this.props.running ? red700 : green700;
  }

  getTotalElapsed() {
    const finishedElapsed = this.props.records
      .filter((record) => (this.props.incompleteRecord
        ? record._id !== this.props.incompleteRecord._id
        : true))
      .map(record => moment(record.end).diff(moment(record.begin)))
      .reduce((l, n) => l + n, 0);
    const current = this.props.incompleteRecord
      ? this.state.now.diff(moment(this.props.incompleteRecord.begin))
      : 0;
    return this.props.records
      ? finishedElapsed + current
      : 0;
  }

  pastMinimum() {
    // TODO: instead of blocking the stop button until minimum time is reached,
    // the ideal would be to discard the record if stopped before the minimum time.
    return this.props.incompleteRecord
      ? moment(this.state.now).diff(moment(this.props.incompleteRecord.begin)) > MINIMUM
      : true;
  }

  handleClick() {
    if (!this.props.running) {
      // start
      insert.call({
        begin: moment().startOf(PRECISION).toDate(),
        end: null,
      });
      const timer = setInterval(this.tick, 33);
      this.setState({
        timer,
        start: moment(),
      });
    } else {
      // stop
      clearInterval(this.state.timer);
      this.setState({
        timer: undefined,
      });

      complete.call({
        id: this.props.incompleteRecord._id,
        end: moment().startOf(PRECISION).toDate(),
      });
    }
  }

  tick() {
    this.setState({ now: moment() });
  }

  renderLoading() {
    return (<Loading type="spokes" color="#000" />);
  }

  renderPage() {
    const buttonHeight = '50px';
    const style = {
      button: {
        width: '100%',
        marginBottom: '20px',
        height: buttonHeight,
      },
      record: {
        fontSize: 28,
        padding: 5,
        listStyleType: 'none',
      },
    };

    const labelStyle = {
      color: '#fff',
      fontWeight: 'bold',
      lineHeight: buttonHeight,
    };

    return (
      <div>
        <ElapsedTimeDisplay time={this.getTotalElapsed()} />
        <div style={{ margin: '0 15px' }}>
          <RaisedButton
            backgroundColor={this.getButtonColor()}
            onClick={this.handleClick}
            style={style.button}
            label={this.getButtonLabel()}
            labelStyle={labelStyle}
            disabled={!this.pastMinimum()}
          />
          <RecordAdd />
          <RecordsListContainer />
        </div>
      </div>
    );
  }

  render() {
    const { loading } = this.props;

    return (
      <div>
        {
          loading ? this.renderLoading() : this.renderPage()
        }
      </div>
    );
  }
}

TrackerPage.propTypes = {
  loading: React.PropTypes.bool,
  running: React.PropTypes.bool,
  incompleteRecord: React.PropTypes.object,
  records: React.PropTypes.array,
};
