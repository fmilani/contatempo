import { Meteor } from 'meteor/meteor';
import { createContainer } from 'meteor/react-meteor-data';
import moment from 'moment';
import { ReactiveVar } from 'meteor/reactive-var';
import TrackerPageWaiter from '../ui/components/TrackerPageWaiter.jsx';
import Records from '../api/records/records.js';
import {
  getDayInterval,
  getMonthInterval,
  getLastMonthInterval,
} from '../api/helpers/date-helpers.js';

export default createContainer(({ params }) => {
  const period = params.period || 'day';
  const settings = Meteor.user().settings;

  let getInterval = getDayInterval;
  let showTrackerButton = true;
  if (period === 'month') {
    getInterval = getMonthInterval;
  } else if (period === 'last_month') {
    getInterval = getLastMonthInterval;
    showTrackerButton = false;
  }

  // reactive var to be update by the TrackerPage component in order to update the subscription
  // according to params
  const checkSubscriptionInterval = new ReactiveVar(moment(), (oldValue, newValue) => (
    getInterval(oldValue).start.isSame(getInterval(newValue).start)
  ));
  const subscriptionInterval = moment(checkSubscriptionInterval.get());
  const startInterval = getInterval(subscriptionInterval, settings.endOfMonth).start.toDate();
  const endInterval = getInterval(subscriptionInterval, settings.endOfMonth).end.toDate();

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
    showTrackerButton,
  };
}, TrackerPageWaiter);
