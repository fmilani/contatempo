import { Meteor } from 'meteor/meteor';
import { withTracker } from 'meteor/react-meteor-data';
import App from '../ui/layouts/App.jsx';

// Pass meteor data to the App component
export default withTracker(() => {
  if (!Meteor.user()) return {};

  const { name, picture } = Meteor.user().profile;

  return {
    currentUser: {
      name,
      picture,
    },
  };
})(App);
