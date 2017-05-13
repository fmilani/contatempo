import React from 'react';
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
import {
  indigo500,
  indigo700,
} from 'material-ui/styles/colors';
import AppDrawer from './AppDrawer.jsx';
import AppBottomNavigation from './AppBottomNavigation.jsx';
import PeriodDropDown from '../components/records/PeriodDropDown.jsx';
import { shareLastMonthReport } from '../../api/records/methods.js';
import URLS from '../../api/helpers/urls.js';

const muiTheme = getMuiTheme({
  palette: {
    primary1Color: indigo500,
    primary2Color: indigo700,
    pickerHeaderColor: indigo500,
  },
});

const isOnHistoryPage = path => `/${path.split('/')[1]}` === URLS.HISTORY.ROOT;
const isOnLastMonthHistoryPage = path => path === URLS.HISTORY.LAST_MONTH;

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

  getChildContext() {
    // set currentUser to context so it can be accessed throughout the application
    return { currentUser: this.props.currentUser };
  }

  handleDrawer() {
    this.appDrawer.handleToggle();
  }

  shareLastMonthReport() {
    shareLastMonthReport.call({
      date: moment().toDate(),
      userId: Meteor.user()._id,
    }, (error) => {
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
    });
  }

  render() {
    // this margin is needed so the content of the app doesn't
    // touch the bottom navigation
    const bottomNavigationMargin = muiTheme.bottomNavigation.height + 15;
    return (
      <MuiThemeProvider muiTheme={muiTheme}>
        <div>
          <Headroom style={{ zIndex: 999 }}>
            <AppBar
              title={
                isOnHistoryPage(this.props.location.pathname)
                  ? <PeriodDropDown />
                  : 'Contatempo'
              }
              onLeftIconButtonTouchTap={this.handleDrawer}
              iconElementRight={
                isOnLastMonthHistoryPage(this.props.location.pathname)
                ?
                  <IconButton onTouchTap={_.debounce(this.shareLastMonthReport, 500)}>
                    <ShareIcon />
                  </IconButton>
                : null
              }
            />
          </Headroom>
          <AppDrawer ref={(c) => { this.appDrawer = c; }} />
          <div style={{ marginBottom: bottomNavigationMargin }}>
            {this.props.children}
          </div>
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
  children: React.PropTypes.element.isRequired,
  currentUser: React.PropTypes.object,
  location: React.PropTypes.shape({
    pathname: React.PropTypes.string,
  }).isRequired,
};

App.childContextTypes = {
  currentUser: React.PropTypes.object,
};

export default App;
