import React from 'react';
import moment from 'moment';
import Paper from 'material-ui/Paper';

/**
 * Displays the elapsed time, passed as a prop, with some nice format.
 *
 * @prop {number} time - the elapsed time, in milliseconds
 */
export default class ElapsedTimeDisplay extends React.Component {

  constructor(props) {
    super(props);

    // bindings
    this.formatHourMinute = this.formatHourMinute.bind(this);
    this.formatSeconds = this.formatSeconds.bind(this);
  }

  // formats the time prop with the hours and minutes (HH:mm)
  formatHourMinute() {
    return moment.utc(this.props.time).format('HH:mm');
  }

  // formats the time prop with only the seconds (ss)
  formatSeconds() {
    return moment.utc(this.props.time).format(':ss');
  }

  render() {
    const paperStyle = {
      textAlign: 'center',
      padding: '20px 0px',
      marginBottom: '20px',
    };

    const secondsStyle = {
      fontSize: '18px',
    };

    return (
      <Paper style={paperStyle}>
        <h1>{this.formatHourMinute()}<span style={secondsStyle}>{this.formatSeconds()}</span></h1>
      </Paper>
    );
  }
}

ElapsedTimeDisplay.propTypes = {
  time: React.PropTypes.number,
};
