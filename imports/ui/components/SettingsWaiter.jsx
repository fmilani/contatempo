import React from 'react';
import Spinner from './Spinner.jsx';
import Settings from './Settings.jsx';

// This component was created so we can control the form on Settings component
// We need the props to be set on the constructor of Settings so we can
// initialize the state and control the form
const SettingsWaiter = (props) => {
  const { loading, ...other } = props;
  return (loading ? <Spinner /> : <Settings {...other} />);
};

SettingsWaiter.propTypes = {
  loading: React.PropTypes.bool,
};

export default SettingsWaiter;
