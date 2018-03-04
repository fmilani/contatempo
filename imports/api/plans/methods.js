import { Meteor } from 'meteor/meteor';
import { ValidatedMethod } from 'meteor/mdg:validated-method';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';
import Plans from './plans.js';
/**
 * Inserts a plan on the database
 * @param {Date} day - the day the plan refers to
 * @param {Date} plannedTime - the time planned
 */
export const insert = new ValidatedMethod({
  name: 'plans.insert',
  validate: new SimpleSchema({
    day: { type: String },
    plannedTime: { type: Number },
  }).validator(),
  run({ day, plannedTime }) {
    const plan = {
      day,
      plannedTime,
      userId: Meteor.user()._id,
    };

    const plansWithSameDay = Plans.find({ day }).fetch();
    if (plansWithSameDay.length > 0) {
      // there is already a plan for this day, update it
      Plans.update(plansWithSameDay[0]._id, {
        $set: {
          plannedTime: plan.plannedTime,
        },
      });
    } else {
      Plans.insert(plan);
    }
  },
});
