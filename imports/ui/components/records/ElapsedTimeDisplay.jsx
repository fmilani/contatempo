import React from 'react';
import moment from 'moment';
import 'moment-duration-format';

/**
 * Displays the elapsed time, passed as a prop, with some nice format.
 *
 * @prop {number} time - the elapsed time, in milliseconds
 */
export default class ElapsedTimeDisplay extends React.Component {

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
    return moment.duration(this.props.time)
      .format('HH:mm:ss', { trim: false }).slice(-3);
  }

  render() {
    const styles = {
      hoursMinutes: {
        fontSize: 24,
      },
      seconds: {
        fontSize: 14,
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

ElapsedTimeDisplay.propTypes = {
  time: React.PropTypes.number,
};

ElapsedTimeDisplay.defaultProps = {
  time: 0,
};
