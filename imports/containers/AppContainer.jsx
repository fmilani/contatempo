import { Meteor } from 'meteor/meteor';
import { createContainer } from 'meteor/react-meteor-data';
import App from '/imports/ui/layouts/App.jsx';

export default createContainer(() => {
  return {
    name: 'World',
  };
}, App);
