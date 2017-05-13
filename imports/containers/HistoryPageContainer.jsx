import { Meteor } from 'meteor/meteor';
import { createContainer } from 'meteor/react-meteor-data';
import moment from 'moment';
import HistoryPage from '../ui/pages/HistoryPage.jsx';
import Records from '../api/records/records.js';
import intervalRecords from '../queries/records/interval-records';
import {
  getDayInterval,
  getWeekInterval,
  getMonthInterval,
  getLastWeekInterval,
  getLastMonthInterval,
} from '../api/helpers/date-helpers.js';

export default createContainer(({ params }) => {
  const period = params.period || 'day';
  const settings = Meteor.user().settings;

  let getInterval = getDayInterval;
  if (period === 'this_month') {
    getInterval = getMonthInterval;
  } else if (period === 'last_month') {
    getInterval = getLastMonthInterval;
  } else if (period === 'this_week') {
    getInterval = getWeekInterval;
  } else if (period === 'last_week') {
    getInterval = getLastWeekInterval;
  }

  const periodDates = getInterval(moment(), settings.endOfMonth);

  const recordsHandle = Meteor.subscribe('records.interval', {
    start: periodDates.start.toDate(),
    end: periodDates.end.toDate(),
  });
  const loading = !recordsHandle.ready();

  const query = intervalRecords({
    start: periodDates.start.toDate(),
    end: periodDates.end.toDate(),
  });
  const records = Records.find(query.find, query.options).fetch();

  return {
    loading,
    records,
  };
}, HistoryPage);
