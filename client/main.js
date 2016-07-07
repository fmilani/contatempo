// client entry point, imports all client code
import { Meteor } from 'meteor/meteor';
import { render } from 'react-dom';
import { renderRoutes } from '/imports/startup/client/routes.jsx';
import injectTapEventPlugin from 'react-tap-event-plugin';

Meteor.startup(() => {
  injectTapEventPlugin();
  
  render(renderRoutes(), document.getElementById('app'));
});
