import { Meteor } from 'meteor/meteor';
import { createContainer } from 'meteor/react-meteor-data';
import TrackerPageWaiter from '/imports/ui/components/TrackerPageWaiter.jsx';
import Records from '../api/records/records.js';
import moment from 'moment';
import { ReactiveVar } from 'meteor/reactive-var';
import { getDayInterval, getMonthInterval } from '../api/helpers/date-helpers.js';

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
