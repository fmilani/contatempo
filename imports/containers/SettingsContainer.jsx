import { Meteor } from 'meteor/meteor';
import { createContainer } from 'meteor/react-meteor-data';
import SettingsWaiter from '../../imports/ui/components/SettingsWaiter.jsx';

// Pass meteor data to the App component
export default createContainer(() => {
  const userSettingsHandler = Meteor.subscribe('user.settings');

  const settings = Meteor.loggingIn() ? {} : Meteor.user().settings;

  return {
    settings,
    loading: !userSettingsHandler.ready(),
    // loading: false,
  };
}, SettingsWaiter);
