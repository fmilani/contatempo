import React from 'react';
import PropTypes from 'prop-types';
import { Meteor } from 'meteor/meteor';
import { _ } from 'lodash';
import { i18n } from 'meteor/universe:i18n';
import Snackbar from 'material-ui/Snackbar';
import moment from 'moment';
import AppBar from 'material-ui/AppBar';
import Headroom from 'react-headroom';
import ShareIcon from 'material-ui/svg-icons/social/share';
import IconButton from 'material-ui/IconButton';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import { indigo500, indigo700 } from 'material-ui/styles/colors';
import AppDrawer from './AppDrawer.jsx';
import AppBottomNavigation from './AppBottomNavigation.jsx';
import RecordAdd from '../components/records/RecordAdd.jsx';
import PeriodDropDown from '../components/records/PeriodDropDown.jsx';
import { shareLastMonthReport } from '../../api/records/methods.js';
import {
  isAHistoryPage,
  isLastMonthHistoryPage,
  URLS,
} from '../../api/helpers/urls.js';

const muiTheme = getMuiTheme({
  palette: {
    primary1Color: indigo500,
    primary2Color: indigo700,
    pickerHeaderColor: indigo500,
  },
});

class App extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      showReportsSentFeedback: false,
      showShareLimitExceededWarning: false,
    };

    // bindings
    this.handleDrawer = this.handleDrawer.bind(this);
    this.shareLastMonthReport = this.shareLastMonthReport.bind(this);
  }

  handleDrawer() {
    this.appDrawer.handleToggle();
  }

  shareLastMonthReport() {
    shareLastMonthReport.call(
      {
        date: moment().toDate(),
        userId: Meteor.user()._id,
      },
      error => {
        if (error) {
          if (error.error === 'records.share.limitExceeded') {
            this.setState({ showShareLimitExceededWarning: true });
          } else {
            // unexpected error. TODO: handle properly (and add logs)
            throw new Error('Unexpected error');
          }
        } else {
          this.setState({ showReportsSentFeedback: true });
        }
      },
    );
  }

  shouldShowRecordAddComponent() {
    return (
      this.props.location.pathname === URLS.NOW ||
      isAHistoryPage(this.props.location.pathname)
    );
  }

  render() {
    // this margin is needed so the content of the app doesn't
    // touch the bottom navigation
    const bottomNavigationMargin = muiTheme.bottomNavigation.height + 15;

    let childrenMarginBottom = bottomNavigationMargin;
    if (this.shouldShowRecordAddComponent()) {
      childrenMarginBottom += muiTheme.floatingActionButton.buttonSize;
    }

    const { currentUser } = this.props;

    return (
      <MuiThemeProvider muiTheme={muiTheme}>
        <div>
          <Headroom style={{ zIndex: 999 }}>
            <AppBar
              title={
                isAHistoryPage(this.props.location.pathname) ? (
                  <PeriodDropDown />
                ) : (
                  'Contatempo'
                )
              }
              onLeftIconButtonTouchTap={this.handleDrawer}
              iconElementRight={
                isLastMonthHistoryPage(this.props.location.pathname) ? (
                  <IconButton
                    onTouchTap={_.debounce(this.shareLastMonthReport, 500)}
                  >
                    <ShareIcon />
                  </IconButton>
                ) : null
              }
            />
          </Headroom>
          <AppDrawer
            ref={c => {
              this.appDrawer = c ? c.getWrappedInstance() : null;
            }}
            userName={currentUser.name}
            userPictureUrl={currentUser.picture}
          />
          <div
            style={{
              margin: '0 auto',
              marginBottom: childrenMarginBottom,
              maxWidth: '600px',
            }}
          >
            {this.props.children}
          </div>
          {this.shouldShowRecordAddComponent() ? <RecordAdd /> : null}
          <AppBottomNavigation />
          <Snackbar
            open={this.state.showReportsSentFeedback}
            message={i18n.getTranslation('records.reportsSentFeedback')}
            autoHideDuration={4000}
            onRequestClose={() => {
              this.setState({ showReportsSentFeedback: false });
            }}
            style={{
              bottom: muiTheme.bottomNavigation.height,
            }}
          />
          <Snackbar
            open={this.state.showShareLimitExceededWarning}
            message={i18n.getTranslation('records.sharelimitExceeded')}
            autoHideDuration={4000}
            onRequestClose={() => {
              this.setState({ showShareLimitExceededWarning: false });
            }}
            style={{
              bottom: muiTheme.bottomNavigation.height,
            }}
          />
        </div>
      </MuiThemeProvider>
    );
  }
}

App.propTypes = {
  children: PropTypes.element.isRequired,
  currentUser: PropTypes.shape({
    name: PropTypes.string,
    picture: PropTypes.string,
  }),
  location: PropTypes.shape({
    pathname: PropTypes.string,
  }).isRequired,
};

App.defaultProps = {
  currentUser: {
    name: 'Login',
    picture: null,
  },
};

export default App;
