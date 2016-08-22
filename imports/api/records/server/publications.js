import { Meteor } from 'meteor/meteor';
import Records from '../records.js';
import { check } from 'meteor/check';

// publish all records of a given user
Meteor.publish('records.all', function recordsAll() {
  return Records.find({ userId: this.userId });
});

Meteor.publish('records.interval', function recordsInterval(dateFrom, dateTo) {
  check(dateFrom, Date);
  check(dateTo, Date);
  return Records.find({
    userId: this.userId,
    begin: {
      $gte: dateFrom,
      $lte: dateTo,
    },
  });
});
