import { Meteor } from 'meteor/meteor';
import { createContainer } from 'meteor/react-meteor-data';
import moment from 'moment';
import RecentRecords from '../ui/components/records/RecentRecords.jsx';
import Records from '../api/records/records.js';
import intervalRecords from '../queries/records/interval-records';

export default createContainer(() => {
  const now = moment();
  const interval = {
    start: moment(now)
      .subtract(2, 'days')
      .startOf('day'),
    end: moment(now).endOf('day'),
  };
  const start = interval.start.toDate();
  const end = interval.end.toDate();
  const recordsHandle = Meteor.subscribe('records.interval', { start, end });
  const loading = !recordsHandle.ready();

  const query = intervalRecords({ start, end });
  const recentRecords = Records.find(query.find, query.options).fetch();

  return {
    loading,
    recentRecords,
  };
}, RecentRecords);
