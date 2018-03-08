import { Mongo } from 'meteor/mongo';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';

/**
 * A plan represents an intent from the user for the total length of the records on a given day.
 * It consists of a day, for which the plan is being made for, the amount of minutes planned and the id of the user that registered it.
 */

// Define the plans collection
const Plans = new Mongo.Collection('plans');

// Define the Plans collection schema
Plans.schema = new SimpleSchema({
  day: { type: String },
  plannedTimeMinutes: { type: Number },
  userId: { type: String, regEx: SimpleSchema.RegEx.Id },
});

export default Plans;
