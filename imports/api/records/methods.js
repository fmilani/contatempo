import { Meteor } from 'meteor/meteor';
import { ValidatedMethod } from 'meteor/mdg:validated-method';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';
import moment from 'moment-timezone';
import Records from './records.js';
import { isValidInsertion, isValidEdition } from './helpers';
import {
  getLastMonthInterval,
  getLastMonth,
} from '../helpers/date-helpers.js';
import sendReportEmail from '../email/send-report-email.jsx';

// the precision with which the record dates are saved. Any unit below this will be zero
const PRECISION = 'seconds';

/**
 * Inserts a record on the database
 * @param {Date} begin - the date that the record begun
 * @param {Date} end - the date that the record ended (optional)
 */
export const insert = new ValidatedMethod({
  name: 'records.insert',
  validate: new SimpleSchema({
    begin: { type: Date },
    end: { type: Date, optional: true },
  }).validator(),
  run({ begin, end }) {
    if (end && !isValidInsertion(begin, end)) {
      throw new Meteor.Error('records.insert.endMustBeAfterBegin',
        'The end of the record must be after its begin');
    }

    const record = {
      begin,
      end,
      userId: Meteor.user()._id,
    };

    Records.insert(record);
  },
});

/**
 * Complete the record with the given id by setting its end date
 * @param {String} id - the id of the record
 * @param {Date} end - the date that the record ended
 */
export const complete = new ValidatedMethod({
  name: 'records.complete',
  validate: new SimpleSchema({
    id: { type: String },
    end: { type: Date },
  }).validator(),
  run({ id, end }) {
    Records.update(id, {
      $set: {
        end: moment(end).startOf(PRECISION).toDate(),
      },
    });
  },
});

/**
 * Edit the given field (begin or end) of the record with the given id
 * @param {String} id - the id of the record
 * @param {String} field - the name of the field to be edited
 * @param {Date} date - the new date value of that field
 */
export const edit = new ValidatedMethod({
  name: 'records.edit',
  validate: new SimpleSchema({
    id: { type: String },
    field: { type: String, allowedValues: ['begin', 'end'] },
    date: { type: Date },
  }).validator(),
  run({ id, field, date }) {
    const record = Records.findOne(id);

    if (!isValidEdition(record, date, field)) {
      throw new Meteor.Error('records.edit.endMustBeAfterBegin',
        'The end of the record must be after its begin');
    }
    if (field === 'begin') {
      Records.update(id, {
        $set: {
          begin: moment(date).startOf(PRECISION).toDate(),
        },
      });
    } else {
      Records.update(id, {
        $set: {
          end: moment(date).startOf(PRECISION).toDate(),
        },
      });
    }
  },
});

/**
 * Remove the record with the given id from the database
 * @param {String} id - the id of the record
 */
export const remove = new ValidatedMethod({
  name: 'records.remove',
  validate: new SimpleSchema({
    id: { type: String },
  }).validator(),
  run({ id }) {
    Records.remove(id);
  },
});

/**
 * Send the user's last month report via email.
 * @param {Date} date - the reference date
 * @param {String} userId - the id of the user
 */
export const shareLastMonthReport = new ValidatedMethod({
  name: 'records.shareLastMonthReport',
  validate: new SimpleSchema({
    date: { type: Date },
    userId: { type: String },
  }).validator(),
  run({ date, userId }) {
    // prevent doing unnecessary client-side work
    if (!Meteor.isServer) return;

    const user = Meteor.users.findOne(userId);
    // get the interval for a month before the reference date
    const interval = getLastMonthInterval(date, user.settings.endOfMonth);

    // get the user timezone so we can calculate the correct records interval
    const userTimezone = user.settings.timezone;
    const timezoneOffset = moment.tz.zone(userTimezone).offset(moment(date).valueOf());
    console.log('offset = ', timezoneOffset);

    const lastMonth = getLastMonth(date, user.settings.endOfMonth);

    // the reports counter are indexed by the year and month
    const reportsSentCounterIndex = `${lastMonth.year()}${lastMonth.month() + 1}`;
    let reportsSent = user.reportsSentCounter
      ? user.reportsSentCounter[reportsSentCounterIndex] || 0
      : 0;
    if (reportsSent >= Meteor.settings.public.maxReportsSend) {
      throw new Meteor.Error('records.share.limitExceeded',
        'The user already sent it\'s maximum of reports this month');
    }
    reportsSent += 1;
    const string = `reportsSentCounter.${reportsSentCounterIndex}`;

    // in case user doesn't still have any reports counter, we create the root
    // object
    let setObject = {
      reportsSentCounter: { [reportsSentCounterIndex]: reportsSent },
    };
    // in case it does, we just update it
    if (user.reportsSentCounter) {
      setObject = {
        [string]: reportsSent,
      };
    }
    Meteor.users.update(user._id, {
      $set: setObject,
    });

    // get the records for that interval (taking user timezone into account)
    const records = Records.find({
      begin: {
        $gte: interval.start.add(timezoneOffset, 'minutes').toDate(),
        $lte: interval.end.add(timezoneOffset, 'minutes').toDate(),
      },
      userId: user._id,
    }, {
      sort: { begin: 1 },
    }).fetch();

    sendReportEmail({
      userName: user.profile.name,
      userTimezone,
      monthString: lastMonth.format('MMMM'),
      records,
    });
  },
});
