import { Meteor } from 'meteor/meteor';
import { createContainer } from 'meteor/react-meteor-data';
import TrackerPage from '/imports/ui/components/TrackerPage.jsx';
import Records from '../api/records/records.js';

export default createContainer(() => {
  const recordsHandle = Meteor.subscribe('records.all');
  const loading = !recordsHandle.ready();
  const incompleteRecord = Records.find({end: null}).fetch()[0];
  const firstRecord = Records.find({}, {sort: {begin: 1}}).fetch()[0];
  const records = Records.find().fetch();
  const running = !!incompleteRecord;

  return {
    loading,
    running,
    incompleteRecord,
    firstRecord,
    records,
  };
}, TrackerPage);
