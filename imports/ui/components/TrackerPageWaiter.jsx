import React from 'react';
import Spinner from './Spinner.jsx';
import TrackerPage from './TrackerPage.jsx';

// This component was created to solve the use case where the user starts recording time
// and then leave the app. Upon reopen of the app, we want the user to see the timer running.
// To do so, we check on TrackerPage component if the is a incomplete record. To do this check
// when the tracker page is created, we need to wait for the incomplete record data to load.
const TrackerPageWaiter = (props) => {
  const { loading, ...other } = props;
  return (loading ? <Spinner /> : <TrackerPage {...other} />);
};

export default TrackerPageWaiter;

TrackerPageWaiter.propTypes = {
  loading: React.PropTypes.bool,
};
