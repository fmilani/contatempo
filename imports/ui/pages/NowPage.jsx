import React from 'react';
import muiThemeable from 'material-ui/styles/muiThemeable';
import NowContainer from '../../containers/NowContainer.jsx';
import RecentRecordsContainer from '../../containers/RecentRecordsContainer.jsx';
import RecordAdd from '../components/records/RecordAdd.jsx';

/**
 * Component that handles the on-going record
 */
const NowPage = props => (
  <div>
    <NowContainer />
    <div style={{ marginTop: 15, paddingBottom: props.muiTheme.floatingActionButton.buttonSize }}>
      <RecentRecordsContainer />
    </div>
    <RecordAdd />
  </div>
);

NowPage.propTypes = {
  muiTheme: React.PropTypes.shape({
    floatingActionButton: React.PropTypes.object,
  }).isRequired,
};

export default muiThemeable()(NowPage);
