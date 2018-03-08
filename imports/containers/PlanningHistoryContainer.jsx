import { Meteor } from 'meteor/meteor';
import { createContainer } from 'meteor/react-meteor-data';
import PlanningHistory from '../ui/components/plans/PlanningHistory.jsx';
import Plans from '../api/plans/plans.js';

export default createContainer(({ dayFrom, dayTo, recordedTime }) => {
  const plansHandle = Meteor.subscribe('plans.days', {
    dayFrom,
    dayTo,
  });
  const loading = !plansHandle.ready();

  const plans = Plans.find({
    day: {
      $gte: dayFrom,
      $lte: dayTo,
    },
  }).fetch();

  return {
    loading,
    recordedTime,
    plans,
  };
}, PlanningHistory);
