import { Mongo } from 'meteor/mongo';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';

/**
 * A record consist of a registered period of time, with the begin and end
 * dates that defines it and the id of the user that registered it.
 */

// Define the plans collection
const Plans = new Mongo.Collection('plans');

// Define the Plans collection schema
Plans.schema = new SimpleSchema({
  day: { type: String },
  plannedTime: { type: Number },
  // userId: { type: String, regEx: SimpleSchema.RegEx.Id },
});

export default Plans;
