import { Meteor } from 'meteor/meteor';
import { check, Match } from 'meteor/check';
import Records from '../records.js';
import intervalRecords from '../../../queries/records/interval-records';

// publish all records of a given user
Meteor.publish('records.all', function recordsAll() {
  return Records.find({ userId: this.userId });
});

Meteor.publish('records.interval', function recordsInterval(
  { start, end },
  sort = -1,
) {
  check(start, Date);
  check(end, Date);
  check(sort, Match.OneOf(-1, 1));
  const query = intervalRecords({ start, end }, sort);
  return Records.find(
    {
      userId: this.userId,
      ...query.find,
    },
    query.options,
  );
});

Meteor.publish('records.incomplete', function incomplete() {
  return Records.find(
    {
      userId: this.userId,
      end: null,
    },
    {
      sort: { begin: 1 },
    },
  );
});
