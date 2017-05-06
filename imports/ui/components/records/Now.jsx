import React from 'react';
import { i18n } from 'meteor/universe:i18n';
import moment from 'moment';
import Paper from 'material-ui/Paper';
import Subheader from 'material-ui/Subheader';
import 'moment-duration-format';
import Spinner from '../Spinner.jsx';
import FormattedTime from './FormattedTime.jsx';
import StartButton from './StartButton.jsx';
import StopButton from './StopButton.jsx';

/**
 * Component that handles the on-going record
 */
export default class Now extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      timer: null,
      now: moment(),
    };

    // the minimum time needed so user can stop recording after it started
    this.MINIMUM_TIME_TO_STOP = 1000;

    // bindings
    this.tick = this.tick.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.currentRecord) {
      this.setState({
        timer: setInterval(this.tick, 33),
      });
    } else {
      clearInterval(this.state.timer);
      this.setState({ timer: null });
    }
  }

  componentWillUnmount() {
    clearInterval(this.state.timer);
    this.setState({ timer: null });
  }

  getElapsedTime() {
    const { currentRecord } = this.props;
    const { now } = this.state;

    if (!currentRecord) return 0;

    let elapsedTime = now.diff(currentRecord.begin);
    if (elapsedTime < 0) {
      elapsedTime = 0;
    }
    return elapsedTime;
  }

  tick() {
    this.setState({ now: moment() });
  }

  render() {
    const { loading, currentRecord } = this.props;
    const { now } = this.state;

    const elapsedTime = this.getElapsedTime();

    const styles = {
      paper: {
        display: 'flex',
        alignItems: 'center',
        padding: '10px 16px',
      },
      nowText: {
        fontSize: 16,
        marginRight: 10,
      },
      buttonWrapper: {
        flexGrow: 2,
      },
    };

    return (
      loading ? <Spinner /> :
      <div>
        <Subheader>{i18n.getTranslation('common.now')}</Subheader>
        <Paper style={styles.paper}>
          <FormattedTime time={elapsedTime} />
          <div style={styles.buttonWrapper}>
            {
              currentRecord ?
                <StopButton
                  currentRecordId={currentRecord._id}
                  canStop={now.diff(currentRecord.begin) >= this.MINIMUM_TIME_TO_STOP}
                /> :
                <StartButton />
            }
          </div>
        </Paper>
      </div>
    );
  }
}

Now.propTypes = {
  loading: React.PropTypes.bool,
  currentRecord: React.PropTypes.shape({
    begin: React.PropTypes.any,
  }),
};

Now.defaultProps = {
  currentRecord: null,
  loading: false,
};
