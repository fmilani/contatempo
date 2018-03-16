import { Meteor } from 'meteor/meteor';
import { withTracker } from 'meteor/react-meteor-data';
import Settings from '../../imports/ui/components/Settings.jsx';

export default withTracker(() => {
  const userSettingsHandler = Meteor.subscribe('user.settings');

  const settings = Meteor.loggingIn() ? {} : Meteor.user().settings;

  return {
    settings,
    loading: !userSettingsHandler.ready(),
  };
})(Settings);
