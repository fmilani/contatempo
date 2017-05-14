import React from 'react';
import { i18n } from 'meteor/universe:i18n';
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';
import FloatingActionButton from 'material-ui/FloatingActionButton';
import ContentAdd from 'material-ui/svg-icons/content/add';
import Snackbar from 'material-ui/Snackbar';
import moment from 'moment';
import DatePicker from 'material-ui/DatePicker';
import TimePicker from 'material-ui/TimePicker';
import muiThemeable from 'material-ui/styles/muiThemeable';
import { insert } from '../../../api/records/methods.js';
import { isValidInsertion } from '../../../api/records/helpers';

/**
 * Component to add a record manually.
 */
class RecordAdd extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      open: false,
      errorOnInsertion: false,
    };

    this.t = i18n.createTranslator('records');
    // bindings
    this.handleOpen = this.handleOpen.bind(this);
    this.handleClose = this.handleClose.bind(this);
    this.addRecord = this.addRecord.bind(this);
    this.showErrorOnInsertion = this.showErrorOnInsertion.bind(this);
  }

  addRecord() {
    const date = moment(this.date.state.date);
    const begin = moment(this.beginTime.state.time)
      .year(date.year())
      .month(date.month())
      .date(date.date())
      .startOf('minutes')
      .toDate();
    const end = moment(this.endTime.state.time)
      .year(date.year())
      .month(date.month())
      .date(date.date())
      .startOf('minutes')
      .toDate();

    if (!isValidInsertion(begin, end)) {
      this.showErrorOnInsertion();
    }

    insert.call({
      begin,
      end,
    }, (error) => {
      if (error) {
        if (error.error === 'records.insert.endMustBeAfterBegin') {
          this.showErrorOnInsertion();
        } else {
          // unexpected error. TODO: handle properly (and add logs)
          throw new Error('Unexpected error');
        }
      }
    });

    this.handleClose();
  }

  showErrorOnInsertion() {
    // if error, set the state value errorOnInsertion so the Snackbar is shown
    this.setState({ errorOnInsertion: true });
    // throw an error so that the modal doesn't dismiss
    throw new Error('Cannot edit record\'s end to a time before its begin');
  }

  handleOpen() {
    this.setState({ open: true });
  }

  handleClose() {
    this.setState({ open: false });
  }

  render() {
    const actions = [
      <FlatButton
        label={i18n.getTranslation('common.cancel')}
        onTouchTap={this.handleClose}
      />,
      <FlatButton
        label={this.t('add_submit')}
        primary
        onTouchTap={this.addRecord}
      />,
    ];

    const { muiTheme } = this.props;
    return (
      <div>
        <FloatingActionButton
          secondary
          style={{
            position: 'fixed',
            bottom: muiTheme.bottomNavigation.height + 10,
            right: 25,
            zIndex: '999',
          }}
          onTouchTap={this.handleOpen}
        >
          <ContentAdd />
        </FloatingActionButton>
        <Dialog
          title={this.t('add_title')}
          actions={actions}
          modal={false}
          open={this.state.open}
          onRequestClose={this.handleClose}
        >
          <DatePicker
            ref={(c) => { this.date = c; }}
            hintText={this.t('day')}
            textFieldStyle={{ width: '100%' }}
            DateTimeFormat={Intl.DateTimeFormat}
            locale={i18n.getLocale()}
            cancelLabel={i18n.getTranslation('common.cancel')}
            dialogContainerStyle={{
              top: -75,
            }}
            firstDayOfWeek={0}
            defaultDate={moment().toDate()}
            autoOk
          />
          <TimePicker
            ref={(c) => { this.beginTime = c; }}
            hintText={this.t('begin')}
            textFieldStyle={{ width: '100%' }}
            format="24hr"
            name="recordTime"
            autoOk
          />
          <TimePicker
            ref={(c) => { this.endTime = c; }}
            hintText={this.t('end')}
            textFieldStyle={{ width: '100%' }}
            format="24hr"
            name="recordTime"
            autoOk
          />
        </Dialog>
        <Snackbar
          // TODO: try to make this Snackbar reusable, as it is almost the same
          // as the one on RecordTime and TrackerPage components
          open={this.state.errorOnInsertion}
          message={i18n.getTranslation('records.errorOnDatesMsg')}
          autoHideDuration={4000}
          onRequestClose={() => { this.setState({ errorOnInsertion: false }); }}
          style={{
            bottom: muiTheme.bottomNavigation.height,
          }}
        />
      </div>
    );
  }
}

RecordAdd.propTypes = {
  muiTheme: React.PropTypes.shape({
    bottomNavigation: React.PropTypes.object,
  }).isRequired,
};

export default muiThemeable()(RecordAdd);
