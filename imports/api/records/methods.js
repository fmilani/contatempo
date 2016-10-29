import { Meteor } from 'meteor/meteor';
import { ValidatedMethod } from 'meteor/mdg:validated-method';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';
import Records from './records.js';
import { isValidInsertion, isValidEdition } from './helpers';
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
    if (!isValidInsertion(begin, end)) {
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
