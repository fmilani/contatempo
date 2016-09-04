import { Meteor } from 'meteor/meteor';
import { createContainer } from 'meteor/react-meteor-data';
import TrackerPageWaiter from '/imports/ui/components/TrackerPageWaiter.jsx';
import Records from '../api/records/records.js';
import moment from 'moment';
import { ReactiveVar } from 'meteor/reactive-var';

/**
 * Gets the day interval of the given date
 * @param {Date} date - the given date
 * @return {Object} - an object representing the interval with start and end dates
 */
const getDayInterval = (date) => {
  const ref = moment(date);

  const start = moment(ref).startOf('day');
  const end = moment(ref).endOf('day');

  return { start, end };
};

/**
 * Gets the month interval of the given date
 * @param {Date} date - the given date
 * @return {Object} - an object representing the interval with start and end dates
 */
const getMonthInterval = (date) => {
  const ref = moment(date);
  const currentMonth = moment(ref).subtract(20, 'days').add(1, 'month')
    .month();
  const start = moment(ref).month(currentMonth - 1).date(21)
    .startOf('day');
  const end = moment(ref).month(currentMonth).date(20)
    .endOf('day');

  return { start, end };
};

export default createContainer(({ params }) => {
  const period = params.period || 'day';

  let getInterval = getDayInterval;
  if (period === 'month') {
    getInterval = getMonthInterval;
  }
  // reactive var to be update by the TrackerPage component in order to update the subscription
  // according to params
  const checkSubscriptionInterval = new ReactiveVar(moment(), (oldValue, newValue) => (
    getInterval(oldValue).start.isSame(getInterval(newValue).start)
  ));
  const subscriptionInterval = moment(checkSubscriptionInterval.get());
  const startInterval = getInterval(subscriptionInterval).start.toDate();
  const endInterval = getInterval(subscriptionInterval).end.toDate();

  const recordsHandle = Meteor.subscribe('records.interval', {
    start: startInterval,
    end: endInterval,
  });
  const loading = !recordsHandle.ready();
  const incompleteRecord = Records.find({
    begin: {
      $gte: startInterval,
      $lte: endInterval,
    },
    end: null,
  }, {
    sort: { begin: 1 },
  }).fetch()[0];
  const records = Records.find({
    begin: {
      $gte: startInterval,
      $lte: endInterval,
    },
  }, {
    sort: { begin: 1 },
  }).fetch();

  return {
    loading,
    incompleteRecord,
    records,
    checkSubscriptionInterval,
  };
}, TrackerPageWaiter);
