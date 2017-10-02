import React from 'react';
import PropTypes from 'prop-types';
import { i18n } from 'meteor/universe:i18n';
import moment from 'moment';
import Paper from 'material-ui/Paper';
import Subheader from 'material-ui/Subheader';
import 'moment-duration-format';
import Spinner from '../Spinner.jsx';
import FormattedTime from './FormattedTime.jsx';
import StartButton from './StartButton.jsx';
import StopButton from './StopButton.jsx';
import withTimer from '../../hocs/withTimer';

/**
 * Component that handles the on-going record
 */
class Now extends React.Component {
  constructor(props) {
    super(props);

    // the minimum time needed so user can stop recording after it started
    this.MINIMUM_TIME_TO_STOP = 1000;
  }

  componentDidMount() {
    if (this.props.currentRecord) {
      this.props.startTimer();
    }
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.currentRecord) {
      this.props.startTimer();
    } else {
      this.props.stopTimer();
    }
  }

  componentWillUnmount() {
    this.props.stopTimer();
  }

  getElapsedTime() {
    const { currentRecord, now } = this.props;

    if (!currentRecord) return 0;

    let elapsedTime = moment(now).diff(currentRecord.begin);
    if (elapsedTime < 0) {
      elapsedTime = 0;
    }
    return elapsedTime;
  }

  render() {
    const { loading, currentRecord, now } = this.props;

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

    return loading ? (
      <Spinner />
    ) : (
      <div>
        <Subheader>{i18n.getTranslation('common.now')}</Subheader>
        <Paper style={styles.paper}>
          <FormattedTime time={elapsedTime} />
          <div style={styles.buttonWrapper}>
            {currentRecord ? (
              <StopButton
                currentRecordId={currentRecord._id}
                canStop={
                  moment(now).diff(currentRecord.begin) >=
                  this.MINIMUM_TIME_TO_STOP
                }
              />
            ) : (
              <StartButton />
            )}
          </div>
        </Paper>
      </div>
    );
  }
}

Now.propTypes = {
  loading: PropTypes.bool,
  currentRecord: PropTypes.shape({
    begin: PropTypes.any,
  }),
  now: PropTypes.shape().isRequired,
  startTimer: PropTypes.func.isRequired,
  stopTimer: PropTypes.func.isRequired,
};

Now.defaultProps = {
  currentRecord: null,
  loading: false,
};

export default withTimer(Now);
