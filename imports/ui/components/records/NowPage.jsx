import React from 'react';
import NowContainer from '../../../containers/NowContainer.jsx';
import RecentRecordsContainer from '../../../containers/RecentRecordsContainer.jsx';

/**
 * Component that handles the on-going record
 */
const NowPage = () => (
  <div>
    <NowContainer />
    <RecentRecordsContainer />
  </div>
);

export default NowPage;
