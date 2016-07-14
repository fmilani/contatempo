import { Mongo } from 'meteor/mongo';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';

/**
 * A record consist of a registered period of time, with the begin and end
 * dates that defines it and the id of the user that registered it.
 */

// Define the records collection
const Records = new Mongo.Collection('records');

// Define the records collection schema
Records.schema = new SimpleSchema({
  begin: { type: Date },
  end: { type: Date, optional: true },
  userId: { type: String, regEx: SimpleSchema.RegEx.Id, optional: true },
});

export default Records;
