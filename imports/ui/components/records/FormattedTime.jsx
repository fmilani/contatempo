import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import 'moment-duration-format';

/**
 * Displays a time with some nice format.
 *
 * @prop {number} time - the time to be formatted, in milliseconds
 * @prop {number} size - the display size of the formatted time
 */
export default class FormattedTime extends React.Component {
  constructor(props) {
    super(props);

    // bindings
    this.formatHourAndMinute = this.formatHourAndMinute.bind(this);
    this.formatSeconds = this.formatSeconds.bind(this);
  }

  // formats the time prop with the hours and minutes (hh:mm)
  formatHourAndMinute() {
    return moment.duration(this.props.time).format('HH:mm', { trim: false });
  }

  // formats the time prop with only the seconds (ss)
  formatSeconds() {
    return moment
      .duration(this.props.time)
      .format('HH:mm:ss', { trim: false })
      .slice(-3);
  }

  render() {
    const { size } = this.props;
    const styles = {
      hoursMinutes: {
        fontSize: size,
      },
      seconds: {
        fontSize: size - 12,
      },
    };

    return (
      <div>
        <span style={styles.hoursMinutes}>{this.formatHourAndMinute()}</span>
        <span style={styles.seconds}>{this.formatSeconds()}</span>
      </div>
    );
  }
}

FormattedTime.propTypes = {
  time: PropTypes.number,
  size: PropTypes.number,
};

FormattedTime.defaultProps = {
  time: 0,
  size: 24,
};
