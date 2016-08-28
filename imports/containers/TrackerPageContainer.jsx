import { Meteor } from 'meteor/meteor';
import { createContainer } from 'meteor/react-meteor-data';
import TrackerPageWaiter from '/imports/ui/components/TrackerPageWaiter.jsx';
import Records from '../api/records/records.js';
import moment from 'moment';
import { ReactiveVar } from 'meteor/reactive-var';


export default createContainer(({ params }) => {
  const interval = params.interval || 'day';
  // reactive var to be update by the TrackerPage component in order to update the subscription
  // according to params
  const checkSubscriptionInterval = new ReactiveVar(moment(), (oldValue, newValue) => (
    oldValue.startOf(interval).isSame(newValue.startOf(interval))
  ));
  const subscriptionInterval = moment(checkSubscriptionInterval.get());
  const startInterval = subscriptionInterval.startOf(interval).toDate();
  const endInterval = subscriptionInterval.endOf(interval).toDate();

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
  }).fetch();

  return {
    loading,
    incompleteRecord,
    records,
    checkSubscriptionInterval,
  };
}, TrackerPageWaiter);
