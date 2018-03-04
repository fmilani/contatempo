import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import Plans from '../plans.js';

Meteor.publish('plans.day', function recordsPlan({ day }) {
  check(day, String);
  return Plans.find({ day, userId: this.userId });
});
