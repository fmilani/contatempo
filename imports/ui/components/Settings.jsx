import React from 'react';
import { Meteor } from 'meteor/meteor';
import { i18n } from 'meteor/universe:i18n';
// import Subheader from 'material-ui/Subheader';
import Title from './Title.jsx';
import { RadioButton, RadioButtonGroup } from 'material-ui/RadioButton';
import RaisedButton from 'material-ui/RaisedButton';
import EndOfMonthEnum from '../../api/settings/EndOfMonthEnum';

export default class Settings extends React.Component {

  constructor(props) {
    super(props);

    this.state = props.settings || {};
    this.state.showError = false;

    this.handleEndOfMonthChange = this.handleEndOfMonthChange.bind(this);
    this.handleSave = this.handleSave.bind(this);
  }

  handleEndOfMonthChange(event, value) {
    this.setState({ endOfMonth: value, showError: false });
  }

  handleSave() {
    if (!this.state.endOfMonth) {
      this.setState({ showError: true });
      return;
    }
    this.setState({ showError: false });

    const settings = {
      endOfMonth: this.state.endOfMonth,
    };
    Meteor.users.update(Meteor.userId(), {
      $set: { settings },
    });
  }

  render() {
    const styles = {
      page: {
        margin: '20px',
      },
      radioButton: {
        marginBottom: 16,
      },
    };
    return (
      <div style={styles.page}>
        <Title title={i18n.getTranslation('settings.header')} />
        <RadioButtonGroup
          name="endOfMonth"
          defaultSelected={this.state.endOfMonth}
          onChange={this.handleEndOfMonthChange}
        >
          <RadioButton
            value={EndOfMonthEnum.LAST_DAY}
            label={i18n.getTranslation('settings.last_day')}
            style={styles.radioButton}
          />
          <RadioButton
            value={EndOfMonthEnum.DAY_20}
            label={i18n.getTranslation('settings.day_20')}
            style={styles.radioButton}
          />
        </RadioButtonGroup>
        <div
          style={{
            visibility: this.state.showError ? 'visible' : 'hidden',
            fontSize: '14px',
            marginBottom: '20px',
            color: '#F44336', // TODO: red500
          }}
        >
          {i18n.getTranslation('settings.error_msg')}
        </div>
        <RaisedButton
          primary
          onClick={this.handleSave}
          label={i18n.getTranslation('common.save')}
          style={{
            marginTop: '20px',
          }}
        />
      </div>
    );
  }
}

Settings.propTypes = {
  settings: React.PropTypes.object,
};
