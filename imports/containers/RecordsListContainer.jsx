import { Meteor } from 'meteor/meteor';
import Records from '../api/records/records.js';
import { createContainer } from 'meteor/react-meteor-data';
import RecordsList from '../ui/components/records/RecordsList.jsx';

export default createContainer(() => {
  const recordsHandle = Meteor.subscribe('records.all');
  const loading = !recordsHandle.ready();
  const records = Records.find().fetch();
  const recordsExists = !loading && !!records;
  return {
    loading,
    records,
    recordsExists,
  };
}, RecordsList);
