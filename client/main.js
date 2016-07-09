// client entry point, imports all client code
import { Meteor } from 'meteor/meteor';
import { render } from 'react-dom';
import { renderRoutes } from '/imports/startup/client/routes.jsx';
import injectTapEventPlugin from 'react-tap-event-plugin';
import { i18n } from 'meteor/universe:i18n';

Meteor.startup(() => {
  injectTapEventPlugin();

  // for now, only pt-BR supported
  i18n.setLocale('pt-BR');

  // wait for locale to be loaded to render the app
  i18n.onceChangeLocale(() => render(renderRoutes(), document.getElementById('app')));
});
