import { Meteor } from 'meteor/meteor';
import { createContainer } from 'meteor/react-meteor-data';
import Settings from '../../imports/ui/components/Settings.jsx';

export default createContainer(() => {
  const userSettingsHandler = Meteor.subscribe('user.settings');

  const settings = Meteor.loggingIn() ? {} : Meteor.user().settings;

  return {
    settings,
    loading: !userSettingsHandler.ready(),
  };
}, Settings);
