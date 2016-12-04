import { Meteor } from 'meteor/meteor';
import { createContainer } from 'meteor/react-meteor-data';
import App from '../ui/layouts/App.jsx';
import { getLastMonth } from '../api/helpers/date-helpers';

// Pass meteor data to the App component
export default createContainer(() => {
  if (!Meteor.user()) return {};

  const lastMonth = getLastMonth();
  const reportsSentCounterIndex = `${lastMonth.year()}${lastMonth.month() + 1}`;
  const { name, picture } = Meteor.user().profile;
  const reportsSentCounter = Meteor.user().reportsSentCounter
    ? Meteor.user().reportsSentCounter[reportsSentCounterIndex] || 0
    : 0;
  return {
    currentUser: {
      name,
      picture,
      reportsSentCounter,
    },
  };
}, App);
