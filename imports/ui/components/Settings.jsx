import React from 'react';
import { Meteor } from 'meteor/meteor';
import { withRouter } from 'react-router';
import { i18n } from 'meteor/universe:i18n';
import { List, ListItem } from 'material-ui/List';
import Subheader from 'material-ui/Subheader';
import Divider from 'material-ui/Divider';
import muiThemeable from 'material-ui/styles/muiThemeable';
import Spinner from './Spinner.jsx';
import EndOfMonthEnum from '../../api/settings/EndOfMonthEnum';
import EndOfMonthDialog from './settings/EndOfMonthDialog.jsx';
import TimezoneDialog from './settings/TimezoneDialog.jsx';

class Settings extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      showEndOfMonthDialog: false,
      showTimezoneDialog: false,
    };

    // bindings
    this.changeEndOfMonthSetting = this.changeEndOfMonthSetting.bind(this);
    this.handleEndOfMonthChange = this.handleEndOfMonthChange.bind(this);
    this.changeTimezoneSetting = this.changeTimezoneSetting.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    const { endOfMonth, timezone } = nextProps.settings;
    this.setState({
      endOfMonth,
      showEndOfMonthError: !endOfMonth,
      showTimezoneError: !timezone,
    });

    if (timezone) {
      this.setState({
        timezone: {
          text: timezone.replace(/_/g, ' ').replace(/\//g, ' - '),
          value: timezone,
        },
      });
    }
  }

  getEndOfMonthText() {
    if (this.state.endOfMonth === EndOfMonthEnum.DAY_20) {
      return i18n.getTranslation('settings.day_20');
    } else if (this.state.endOfMonth === EndOfMonthEnum.LAST_DAY) {
      return i18n.getTranslation('settings.last_day');
    }

    return i18n.getTranslation('Please select one');
  }

  getTimezoneText() {
    return this.props.settings.timezone || 'Please select one';
  }

  changeTimezoneSetting(changeRequest, index) {
    if (index !== -1) {
      this.setState({
        timezone: changeRequest,
        showTimezoneError: false,
      });
      const settings = {
        ...this.props.settings,
        timezone: changeRequest.value,
      };
      Meteor.users.update(Meteor.userId(), { $set: { settings } }, error => {
        if (error) {
          console.log('Something went wrong =(.');
        }
      });
      this.setState({ showTimezoneDialog: false });
    } else {
      // the user didn't select a valid timezone
      this.setState({
        timezone: null,
        showTimezoneError: true,
      });
    }
  }

  handleEndOfMonthChange(event, value) {
    this.setState({ endOfMonth: value, showEndOfMonthError: false });
  }

  changeEndOfMonthSetting(event, value) {
    if (value === this.props.settings.endOfMonth) return;

    const settings = { ...this.props.settings, endOfMonth: value };
    Meteor.users.update(
      Meteor.userId(),
      {
        $set: { settings },
      },
      error => {
        if (error) {
          console.log('Something went wrong! =(');
        }
      },
    );
    this.setState({ showEndOfMonthDialog: false });
  }

  renderPage() {
    const { settings } = this.props;
    const timezone = settings.timezone || '';

    return (
      <div>
        <List>
          <Subheader>{i18n.getTranslation('settings.general')}</Subheader>
          <ListItem
            primaryText="Dia em que termina o mês"
            secondaryText={this.getEndOfMonthText()}
            onTouchTap={() => {
              this.setState({ showEndOfMonthDialog: true });
            }}
          />
          <ListItem
            primaryText="Fuso Horário"
            secondaryText={this.getTimezoneText()}
            onTouchTap={() => {
              this.setState({ showTimezoneDialog: true });
            }}
          />
          <TimezoneDialog
            open={this.state.showTimezoneDialog}
            timezone={timezone}
            onChange={this.changeTimezoneSetting}
            onCancelClick={() => {
              this.setState({ showTimezoneDialog: false });
            }}
            onRequestClose={() => {
              this.setState({ showTimezoneDialog: false });
            }}
          />
        </List>
        <Divider />
        <EndOfMonthDialog
          open={this.state.showEndOfMonthDialog}
          endOfMonth={this.state.endOfMonth}
          onChange={this.changeEndOfMonthSetting}
          onCancelClick={() => {
            this.setState({ showEndOfMonthDialog: false });
          }}
          onRequestClose={() => {
            this.setState({ showEndOfMonthDialog: false });
          }}
        />
        <div
          style={{
            visibility: this.state.showEndOfMonthError ? 'visible' : 'hidden',
            fontSize: '14px',
            marginBottom: '20px',
            color: '#F44336', // TODO: red500
          }}
        >
          {i18n.getTranslation('settings.no_end_of_month_msg')}
        </div>
        <div
          style={{
            visibility: this.state.showTimezoneError ? 'visible' : 'hidden',
            fontSize: '14px',
            marginBottom: '20px',
            color: '#F44336', // TODO: red500
          }}
        >
          {i18n.getTranslation('settings.no_timezone_msg')}
        </div>
      </div>
    );
  }

  render() {
    const { loading } = this.props;
    return loading ? <Spinner /> : this.renderPage();
  }
}

Settings.propTypes = {
  loading: React.PropTypes.bool.isRequired,
  settings: React.PropTypes.shape({
    endOfMonth: React.PropTypes.string,
    timezone: React.PropTypes.string,
  }).isRequired,
};

export default withRouter(muiThemeable()(Settings));
