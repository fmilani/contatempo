import { Meteor } from 'meteor/meteor';
import { createContainer } from 'meteor/react-meteor-data';
import App from '../../imports/ui/layouts/App.jsx';

// Pass meteor data to the App component
export default createContainer(() => ({
  currentUser: Meteor.user() ? Meteor.user().profile : {},
}), App);
