import { Meteor } from 'meteor/meteor';
import { Accounts } from 'meteor/accounts-base';
import { ServiceConfiguration } from 'meteor/service-configuration';
import { _ } from 'lodash';

const services = Meteor.settings.private.oAuth;

(() => {
  if (services) {
    _.forOwn(services, (data, service) => {
      ServiceConfiguration.configurations.upsert({ service }, {
        $set: data,
      });
    });
  }
})();

Accounts.onCreateUser((options, user) => {
  const newUser = user;
  const profile = options.profile;

  // keeps the default hook
  if (profile) {
    newUser.profile = profile;
  }

  // copy the profile picture and email to the users' meteor profile
  _.forOwn(newUser.services, (data) => {
    // although this is a for loop, a user should only have 1 service
    newUser.profile.picture = data.picture;
    newUser.profile.email = data.email;
  });

  return newUser;
});

// FIXME: deny user updates and create user api
Meteor.users.allow({
  update() { return true; },
});
