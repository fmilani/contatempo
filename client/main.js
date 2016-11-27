// client entry point, imports all client code
import { Meteor } from 'meteor/meteor';
import { render } from 'react-dom';
import { i18n } from 'meteor/universe:i18n';
import moment from 'moment';
// FIXME: importing this moment locale is causing a warning on browser's console
// without this import, setting moment's locale doesn't work
import 'moment/locale/pt-br';
import injectTapEventPlugin from 'react-tap-event-plugin';
import renderRoutes from '../imports/startup/client/routes.jsx';

Meteor.startup(() => {
  injectTapEventPlugin();

  // for now, only pt-BR supported
  moment.locale('pt-br', {
    calendar: {
      sameDay: '[Hoje]',
      nextDay: '[Amanhã]',
      nextWeek: 'ddd, DD [de] MMMM',
      lastDay: '[Ontem]',
      lastWeek: 'ddd, DD [de] MMMM',
      sameElse: 'ddd, DD [de] MMMM',
    },
  });
  i18n.setLocale('pt-BR');

  // wait for locale to be loaded to render the app
  i18n.onceChangeLocale(() => {
    Meteor.subscribe('user.settings', {
      // wait for user settings to be available. we need it to decide if we
      // redirect the user to settings page
      onReady() {
        render(renderRoutes(), document.getElementById('app'));
      },
    });
  });
});
