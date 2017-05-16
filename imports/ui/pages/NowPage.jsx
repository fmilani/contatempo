import React from 'react';
import NowContainer from '../../containers/NowContainer.jsx';
import RecentRecordsContainer from '../../containers/RecentRecordsContainer.jsx';

/**
 * Component that handles the on-going record
 */
const NowPage = () => (
  <div>
    <NowContainer />
    <div style={{ marginTop: 15 }}>
      <RecentRecordsContainer />
    </div>
  </div>
);

export default NowPage;
