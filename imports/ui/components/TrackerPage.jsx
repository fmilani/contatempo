import React from 'react';
import moment from 'moment';
import { i18n } from 'meteor/universe:i18n';
import ElapsedTimeDisplay from './ElapsedTimeDisplay.jsx';
import RaisedButton from 'material-ui/RaisedButton';
import { teal300, teal500, teal700, blueGrey500 } from 'material-ui/styles/colors';

const SECOND = 1000;

export default class TrackerPage extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      timer: undefined,
      running: false,
      elapsed: 0,
      diff: 0,
      records: [],
    }

    // bindings
    this.tick = this.tick.bind(this);
    this.handleClick = this.handleClick.bind(this);
    this.reset = this.reset.bind(this);
    this.getButtonLabel = this.getButtonLabel.bind(this);
    this.getButtonColor = this.getButtonColor.bind(this);
  }

  componentWillUnmount() {
    clearInterval(this.state.timer);
    this.setState({ timer: undefined });
  }

  tick() {
    const elapsed = this.round(moment() - this.state.start + this.state.diff);
    this.setState({elapsed: elapsed});
  }

  formatRecord(time) {
    return moment(time).format('HH:mm:ss');
  }

  round(time) {
    return Math.floor(time/SECOND)*SECOND;
  }

  handleClick() {
    if(!this.state.running) { // start
      var timer = setInterval(this.tick, 33);
      this.setState({
        running: true,
        timer: timer,
        start: moment()
      });
    } else { // pause
      const elapsed = this.round(this.state.elapsed);
      clearInterval(this.state.timer);
      this.setState({
        timer: undefined,
        running: false,
        diff: elapsed,
      });
      this.state.records.push({
        label: [
          this.formatRecord(this.state.start),
          this.formatRecord(this.state.start.add(this.state.elapsed-this.state.diff))
        ].join(' - ')
      });
    }
  }

  reset() {
    clearInterval(this.state.timer);
    this.setState({
      timer: undefined,
      running: false,
      elapsed: 0,
      diff: 0,
      records: [],
    });
  }

  getButtonLabel() {
    return i18n.getTranslation(this.state.running ? 'tracker_page.stop' : 'tracker_page.start');
  }

  getButtonColor() {
    return this.state.running ? '#D32F2F' : '#388E3C';
  }

  render() {
    const buttonHeight = '50px';
    const style = {
      button: {
        width: '100%',
        marginBottom: '10px',
        height: buttonHeight,
      },
      record: {
        fontSize: 28,
        padding: 5,
        listStyleType: 'none',
      }
    };

    const labelStyle = {
      color: '#fff',
      fontWeight: 'bold',
      lineHeight: buttonHeight
    }

    let id=0;

    return (
      <div>
        <ElapsedTimeDisplay time={this.state.elapsed} />
        <div style={{ margin: '0 15px' }}>
          <RaisedButton
            backgroundColor={this.getButtonColor()}
            onClick={this.handleClick}
            style={style.button}
            label={this.getButtonLabel()}
            labelStyle={labelStyle}
          >
          </RaisedButton>
          <RaisedButton onClick={this.reset} style={style.button}>reset</RaisedButton>
          <ul style={style.record}>
            {this.state.records.map(function(record) {
              return <li key={id++}>{record.label}</li>;
            })}
          </ul>
        </div>
      </div>
    );
  }
}
