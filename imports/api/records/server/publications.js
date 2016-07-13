import { Meteor } from 'meteor/meteor';
import Records from '../records.js';

// publish all records
// TODO: create a publication of only the records of a given user. Maybe all records will
// be useful for some admin business. There is also the need to publish only the records for
// the current day..for the current week..and so on
Meteor.publish('records.all', () => Records.find());
