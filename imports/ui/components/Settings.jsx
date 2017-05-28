import React from 'react';
import { Meteor } from 'meteor/meteor';
import { withRouter } from 'react-router';
import { i18n } from 'meteor/universe:i18n';
import moment from 'moment-timezone';
import { RadioButton, RadioButtonGroup } from 'material-ui/RadioButton';
import RaisedButton from 'material-ui/RaisedButton';
import AutoComplete from 'material-ui/AutoComplete';
import Snackbar from 'material-ui/Snackbar';
import muiThemeable from 'material-ui/styles/muiThemeable';
import Spinner from './Spinner.jsx';
import Title from './Title.jsx';
import EndOfMonthEnum from '../../api/settings/EndOfMonthEnum';

class Settings extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      showSettingsSavedFeedback: false,
    };

    // bindings
    this.handleEndOfMonthChange = this.handleEndOfMonthChange.bind(this);
    this.handleSave = this.handleSave.bind(this);
    this.onNewRequest = this.onNewRequest.bind(this);
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

  onNewRequest(changeRequest, index) {
    if (index !== -1) {
      this.setState({
        timezone: changeRequest,
        showTimezoneError: false,
      });
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

  handleSave() {
    this.setState({
      showEndOfMonthError: !this.state.endOfMonth,
      showTimezoneError: !this.state.timezone,
    });
    if (!this.state.endOfMonth || !this.state.timezone) {
      return;
    }

    const settings = {
      endOfMonth: this.state.endOfMonth,
      timezone: this.state.timezone.value,
    };
    Meteor.users.update(
      Meteor.userId(),
      {
        $set: { settings },
      },
      error => {
        if (!error) {
          this.setState({ showSettingsSavedFeedback: true });
        }
      },
    );
  }

  renderPage() {
    const styles = {
      page: {
        margin: '20px',
      },
      radioButton: {
        marginBottom: 16,
      },
    };

    const { settings, muiTheme } = this.props;
    const timezone = settings.timezone || '';

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
            visibility: this.state.showEndOfMonthError ? 'visible' : 'hidden',
            fontSize: '14px',
            marginBottom: '20px',
            color: '#F44336', // TODO: red500
          }}
        >
          {i18n.getTranslation('settings.no_end_of_month_msg')}
        </div>
        <div>
          <AutoComplete
            floatingLabelText={i18n.getTranslation('settings.timezone_label')}
            hintText={i18n.getTranslation('settings.timezone_hint')}
            filter={AutoComplete.fuzzyFilter}
            dataSource={moment.tz.names().map(tzName => ({
              text: `${tzName.replace(/_/g, ' ').replace(/\//g, ' - ')}`,
              value: tzName,
            }))}
            maxSearchResults={5}
            onNewRequest={this.onNewRequest}
            searchText={timezone.replace(/_/g, ' ').replace(/\//g, ' - ')}
          />
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
        <RaisedButton
          primary
          onClick={this.handleSave}
          label={i18n.getTranslation('common.save')}
          style={{
            marginTop: '20px',
          }}
        />
        <Snackbar
          open={this.state.showSettingsSavedFeedback}
          message={i18n.getTranslation('settings.save_success')}
          autoHideDuration={2000}
          onRequestClose={() => {
            this.setState({ showSettingsSavedFeedback: false });
            // TODO: we're changing route here so the Snackbar has a chance
            // to appear to the user (ideally we want to change route right after
            // settings are saved, but then we need another way to show a
            // feedback to the user)
            this.props.router.push('/');
          }}
          style={{
            bottom: muiTheme.bottomNavigation.height,
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
  loading: React.PropTypes.bool.isRequired,
  muiTheme: React.PropTypes.shape({
    bottomNavigation: React.PropTypes.object,
  }).isRequired,
  router: React.PropTypes.shape({
    push: React.PropTypes.func,
  }).isRequired,
  settings: React.PropTypes.shape({
    endOfMonth: React.PropTypes.string,
    timezone: React.PropTypes.string,
  }).isRequired,
};

export default withRouter(muiThemeable()(Settings));
