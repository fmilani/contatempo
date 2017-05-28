import { Meteor } from 'meteor/meteor';
import { createContainer } from 'meteor/react-meteor-data';
import Now from '../ui/components/records/Now.jsx';
import Records from '../api/records/records.js';

export default createContainer(() => {
  const recordsHandle = Meteor.subscribe('records.incomplete');
  const loading = !recordsHandle.ready();
  const currentRecord = Records.find(
    {
      end: null,
    },
    {
      sort: { begin: 1 },
    },
  ).fetch()[0];

  return {
    loading,
    currentRecord,
  };
}, Now);
