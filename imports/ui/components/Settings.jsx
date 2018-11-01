import React from 'react';
import PropTypes from 'prop-types';
import { Meteor } from 'meteor/meteor';
import { withRouter } from 'react-router';
import { i18n } from 'meteor/universe:i18n';
import { List, ListItem } from 'material-ui/List';
import Subheader from 'material-ui/Subheader';
import Toggle from 'material-ui/Toggle';
import Divider from 'material-ui/Divider';
import muiThemeable from 'material-ui/styles/muiThemeable';
import Spinner from './Spinner.jsx';
import EndOfMonthEnum from '../../api/settings/EndOfMonthEnum';
import EndOfMonthDialog from './settings/EndOfMonthDialog.jsx';
import TimezoneDialog from './settings/TimezoneDialog.jsx';
import ReportsEmailDialog from './settings/ReportsEmailDialog.jsx';

class Settings extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      showEndOfMonthDialog: false,
      showTimezoneDialog: false,
      showReportsEmailDialog: false,
    };

    // bindings
    this.changeEndOfMonthSetting = this.changeEndOfMonthSetting.bind(this);
    this.handleEndOfMonthChange = this.handleEndOfMonthChange.bind(this);
    this.changeTimezoneSetting = this.changeTimezoneSetting.bind(this);
    this.changeReportsEmailSetting = this.changeReportsEmailSetting.bind(this);
    this.changeSendReportsToSelfSetting = this.changeSendReportsToSelfSetting.bind(
      this,
    );
  }

  componentWillReceiveProps(nextProps) {
    let { endOfMonth, timezone } = nextProps.settings;
    this.setState({
      endOfMonth,
      showEndOfMonthError: !endOfMonth,
      showTimezoneError: !timezone,
    });

    if (!timezone) {
      timezone = '';
    }
    this.setState({
      timezone: {
        text: timezone.replace(/_/g, ' ').replace(/\//g, ' - '),
        value: timezone,
      },
    });
  }

  getEndOfMonthText() {
    if (this.state.endOfMonth === EndOfMonthEnum.DAY_20) {
      return i18n.getTranslation('settings.day_20');
    } else if (this.state.endOfMonth === EndOfMonthEnum.LAST_DAY) {
      return i18n.getTranslation('settings.last_day');
    }

    return i18n.getTranslation('common.touch_to_choose');
  }

  getTimezoneText() {
    return (
      this.props.settings.timezone ||
      i18n.getTranslation('common.touch_to_choose')
    );
  }

  changeSendReportsToSelfSetting(event, sendReportsToSelf) {
    const settings = {
      ...this.props.settings,
      sendReportsToSelf,
    };
    Meteor.users.update(Meteor.userId(), { $set: { settings } }, error => {
      if (error) {
        console.log('Something went wrong =(.');
      }
    });
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

  changeReportsEmailSetting(reportsEmail) {
    const settings = { ...this.props.settings, reportsEmail };
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
  }

  renderPage() {
    const { settings } = this.props;
    let timezone = this.state.timezone;
    timezone = timezone || '';

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
          {this.state.showEndOfMonthError ? (
            <div
              style={{
                fontSize: '14px',
                marginLeft: '16px',
                color: '#F44336', // TODO: red500
              }}
            >
              {i18n.getTranslation('settings.no_end_of_month_msg')}
            </div>
          ) : null}
          <ListItem
            primaryText="Fuso Horário"
            secondaryText={this.getTimezoneText()}
            onTouchTap={() => {
              this.setState({ showTimezoneDialog: true });
            }}
          />
          {this.state.showTimezoneError ? (
            <div
              style={{
                fontSize: '14px',
                marginLeft: '16px',
                color: '#F44336', // TODO: red500
              }}
            >
              {i18n.getTranslation('settings.no_timezone_msg')}
            </div>
          ) : null}
        </List>
        <Divider />
        <List>
          <Subheader>{i18n.getTranslation('common.reports')}</Subheader>
          <ListItem
            primaryText={i18n.getTranslation('email.settings_label')}
            secondaryText={
              this.props.settings.reportsEmail ||
              i18n.getTranslation('common.touch_to_choose')
            }
            onTouchTap={() => {
              this.setState({ showReportsEmailDialog: true });
            }}
          />
          <ListItem
            primaryText={i18n.getTranslation('settings.send_copy_to_me')}
            secondaryText={i18n.getTranslation('settings.send_copy_to_me_hint')}
            rightToggle={
              <Toggle
                toggled={settings.sendReportsToSelf}
                onToggle={this.changeSendReportsToSelfSetting}
              />
            }
          />
        </List>
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
          onUpdateInput={searchText => {
            this.setState({
              timezone: {
                text: searchText.replace(/_/g, ' ').replace(/\//g, ' - '),
                value: searchText,
              },
            });
          }}
        />
        <ReportsEmailDialog
          email={this.props.settings.reportsEmail}
          open={this.state.showReportsEmailDialog}
          onConfirmClick={this.changeReportsEmailSetting}
          onCancelClick={() => {
            this.setState({ showReportsEmailDialog: false });
          }}
          onRequestClose={() => {
            this.setState({ showReportsEmailDialog: false });
          }}
        />
      </div>
    );
  }

  render() {
    const { loading } = this.props;
    return loading ? <Spinner /> : this.renderPage();
  }
}

Settings.propTypes = {
  loading: PropTypes.bool.isRequired,
  settings: PropTypes.shape({
    reportsEmail: PropTypes.string,
    endOfMonth: PropTypes.string,
    timezone: PropTypes.string,
  }).isRequired,
};

export default withRouter(muiThemeable()(Settings));
