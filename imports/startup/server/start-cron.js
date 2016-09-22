import { SyncedCron } from 'meteor/percolate:synced-cron';
import { sendReports } from '../../api/email/server/reports.js';

SyncedCron.add({
  name: 'Send reports',
  schedule(parser) {
    // TODO: make the schedule configurable (based on users 'end of month')
    return parser.recur()
      .on(21)
      .dayOfMonth()
      .on(5)
      .hour();
  },
  job() {
    sendReports();
  },
});

SyncedCron.start();
