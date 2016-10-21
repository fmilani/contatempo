import { Meteor } from 'meteor/meteor';

// publish app settings of a given user
Meteor.publish('user.settings', function userSettings() {
  // return only the settings field from the logged user
  return Meteor.users.find({ _id: this.userId }, { fields: { settings: 1 } });
});
