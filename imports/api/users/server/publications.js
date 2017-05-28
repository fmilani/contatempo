import { Meteor } from 'meteor/meteor';

// publish the reports sent counter of a given user
Meteor.publish('user.reportsSentCounter', function userSettings() {
  return Meteor.users.find(
    {
      _id: this.userId,
    },
    {
      fields: { reportsSentCounter: 1 },
    },
  );
});
