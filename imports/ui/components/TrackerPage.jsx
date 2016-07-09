import React from 'react';
import moment from 'moment';
import { i18n } from 'meteor/universe:i18n';
import ElapsedTimeDisplay from './ElapsedTimeDisplay.jsx';

const SECOND = 1000;
const T = i18n.createComponent(i18n.createTranslator('tracker_page'));

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

  render() {
    var style = {
      button: {
        fontSize: 20,
        height: 44,
        width: 88,
        margin: 5,
      },
      record: {
        fontSize: 28,
        padding: 5,
        listStyleType: 'none',
      }
    };

    let id=0;

    return (
      <div>
        <ElapsedTimeDisplay time={this.state.elapsed} />
        <button onClick={this.handleClick} style={style.button}>
          <T>{this.state.running ? 'stop' : 'start'}</T>
        </button>
        <button onClick={this.reset} style={style.button}>reset</button>
        <ul style={style.record}>
          {this.state.records.map(function(record) {
            return <li key={id++}>{record.label}</li>;
          })}
        </ul>
      </div>
    );
  }
}
