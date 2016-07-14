import { createContainer } from 'meteor/react-meteor-data';
import App from '/imports/ui/layouts/App.jsx';

export default createContainer(() => ({
  name: 'World',
}), App);
