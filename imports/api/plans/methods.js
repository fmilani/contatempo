import { Meteor } from 'meteor/meteor';
import { ValidatedMethod } from 'meteor/mdg:validated-method';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';
import Rollbar from 'meteor/saucecode:rollbar';
import Plans from './plans.js';
/**
 * Inserts a plan on the database
 * @param {Date} day - the day the plan refers to
 * @param {Date} plannedTimeMinutes - the time planned in minutes
 */
export const insert = new ValidatedMethod({
  name: 'plans.insert',
  validate: new SimpleSchema({
    day: { type: String },
    plannedTimeMinutes: { type: Number },
  }).validator(),
  run({ day, plannedTimeMinutes }) {
    if (!plannedTimeMinutes) {
      throw new Meteor.Error(
        'plans.insert.cannotEditPlanWithoutTime',
        'You must set a planned time greater than 0',
      );
    }
    const plan = {
      day,
      plannedTimeMinutes,
      userId: Meteor.user()._id,
    };

    const plansWithSameDay = Plans.find({
      day,
      userId: Meteor.user()._id,
    }).fetch();
    if (plansWithSameDay.length > 0) {
      // there is already a plan for this day, update it
      Plans.update(
        plansWithSameDay[0]._id,
        {
          $set: {
            plannedTimeMinutes: plan.plannedTimeMinutes,
          },
        },
        error => {
          if (error) {
            Rollbar.handleError(error);
          }
        },
      );
    } else {
      Plans.insert(plan, error => {
        if (error) {
          Rollbar.handleError(error);
        }
      });
    }
  },
});
