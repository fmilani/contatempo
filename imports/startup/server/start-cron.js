import { Meteor } from 'meteor/meteor';
import { SyncedCron } from 'meteor/percolate:synced-cron';
import sendReports from '../../api/email/server/reports.jsx';
import EndOfMonthEnum from '../../api/settings/EndOfMonthEnum';

SyncedCron.add({
  name: 'Send reports for users with end of month on last day',
  schedule(parser) {
    return parser.recur()
      .on(1)
      .dayOfMonth()
      .on(Meteor.settings.private.reportsHour)
      .hour();
  },
  job() {
    sendReports(undefined, EndOfMonthEnum.LAST_DAY);
  },
});

SyncedCron.add({
  name: 'Send reports for users with end of month on day 20',
  schedule(parser) {
    return parser.recur()
      .on(21)
      .dayOfMonth()
      .on(Meteor.settings.private.reportsHour)
      .hour();
  },
  job() {
    sendReports(undefined, EndOfMonthEnum.DAY_20);
  },
});

SyncedCron.start();
