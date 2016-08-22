import { Meteor } from 'meteor/meteor';
import { createContainer } from 'meteor/react-meteor-data';
import TrackerPage from '/imports/ui/components/TrackerPage.jsx';
import Records from '../api/records/records.js';
import moment from 'moment';

export default createContainer(() => {
  const today = moment();
  const startOfDay = today.startOf('day').toDate();
  const endOfDay = today.endOf('day').toDate();

  const recordsHandle = Meteor.subscribe('records.interval', startOfDay, endOfDay);
  const loading = !recordsHandle.ready();
  const incompleteRecord = Records.find({ end: null }).fetch()[0];
  const records = Records.find({
    begin: {
      $gte: startOfDay,
      $lte: endOfDay,
    },
  }).fetch();
  const running = !!incompleteRecord;

  return {
    loading,
    running,
    incompleteRecord,
    records,
  };
}, TrackerPage);
