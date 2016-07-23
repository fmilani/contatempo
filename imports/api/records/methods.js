import { Meteor } from 'meteor/meteor';
import { ValidatedMethod } from 'meteor/mdg:validated-method';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';
import Records from './records.js';
import moment from 'moment';

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

    if (field === 'begin') {
      if (moment(date).isAfter(moment(record.end))) {
        throw new Meteor.Error('records.edit.beginAfterEnd',
          'Cannot edit record\'s begin to a time after its end');
      }
      Records.update(id, {
        $set: {
          begin: moment(date).startOf(PRECISION).toDate(),
        },
      });
    } else {
      if (moment(date).isBefore(moment(record.begin))) {
        throw new Meteor.Error('records.edit.endBeforeBegin',
        'Cannot edit record\'s end to a time before its begin');
      }
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
