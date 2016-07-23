import { Meteor } from 'meteor/meteor';
import Records from '../records.js';

// publish all records of a given user
Meteor.publish('records.all', function recordsAll() {
  return Records.find({ userId: this.userId });
});
