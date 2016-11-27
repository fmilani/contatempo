import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import Records from '../records.js';

// publish all records of a given user
Meteor.publish('records.all', function recordsAll() {
  return Records.find({ userId: this.userId });
});

Meteor.publish('records.interval', function recordsInterval({ start, end }) {
  check(start, Date);
  check(end, Date);
  return Records.find({
    userId: this.userId,
    begin: {
      $gte: start,
      $lte: end,
    },
  });
});
