import { Meteor } from 'meteor/meteor';
import { ValidatedMethod } from 'meteor/mdg:validated-method';
import Records from './records.js';
import moment from 'moment';
/**
 * Inserts a record on the database
 * @param {Date} begin - the date that the record begun
 * @param {Date} end - the date that the record ended (optional)
 */
export const insert = new ValidatedMethod({
  name: 'records.insert',
  validate: Records.schema.validator(),
  run({ begin, end }) {

    const record = {
      begin,
      end,
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
    id: {type: String },
    end: { type: Date },
  }).validator(),
  run({ id, end }) {

    Records.update(id, {
      $set: {
        end: moment(end).startOf('seconds').toDate(),
      },
    });
  },
})
