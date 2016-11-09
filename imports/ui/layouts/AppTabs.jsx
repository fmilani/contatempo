import React from 'react';
import { i18n } from 'meteor/universe:i18n';
import { Tabs, Tab } from 'material-ui/Tabs';

// Component to render the tabs below AppBar. The only prop is the location object,
// injected via the react-router and passed from the App component
const AppTabs = (props, context) => (
  <Tabs
    value={props.location.pathname}
    style={{
      // workaround until AppBar is composable (then tabs will be inside it)
      boxShadow: '0 1px 6px rgba(0,0,0,0.12), 0 1px 4px rgba(0,0,0,0.12)',
      WebkitBoxShadow: '0 1px 6px rgba(0,0,0,0.12), 0 1px 4px rgba(0,0,0,0.12)',
      MozBoxShadow: '0 1px 6px rgba(0,0,0,0.12), 0 1px 4px rgba(0,0,0,0.12)',
    }}
  >
    <Tab
      label={i18n.getTranslation('common.today')}
      onActive={() => { context.router.push('/'); }}
      value={'/'}
    />
    <Tab
      label={i18n.getTranslation('common.this_month')}
      onActive={() => { context.router.push('/month'); }}
      value={'/month'}
    />
    <Tab
      label={i18n.getTranslation('common.last_month')}
      onActive={() => { context.router.push('/last_month'); }}
      value={'/last_month'}
    />
  </Tabs>
);

AppTabs.propTypes = {
  location: React.PropTypes.object,
};

AppTabs.contextTypes = {
  router: React.PropTypes.object,
};

export default AppTabs;
