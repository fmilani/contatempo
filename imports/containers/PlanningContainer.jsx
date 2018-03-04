import { Meteor } from 'meteor/meteor';
import { createContainer } from 'meteor/react-meteor-data';
import moment from 'moment';
import Planning from '../ui/components/Planning.jsx';
import Plans from '../api/plans/plans.js';

export default createContainer(({ day, elapsed }) => {
  const plannedDay = day || moment().format('YYYY-MM-DD');

  const plansHandle = Meteor.subscribe('plans.day', {
    day: plannedDay,
  });
  const loading = !plansHandle.ready();

  const plans = Plans.find({ day: plannedDay }).fetch()[0];

  return {
    loading,
    day,
    elapsed,
    plans,
  };
}, Planning);
