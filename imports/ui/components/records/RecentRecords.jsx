import React from 'react';
import PropTypes from 'prop-types';
import { i18n } from 'meteor/universe:i18n';
import RecordsList from './RecordsList.jsx';

/**
 * Component that shows the list of the recent records
 */
const RecentRecords = props => (
  <RecordsList
    records={props.recentRecords}
    title={i18n.getTranslation('common.last_days')}
  />
);

RecentRecords.propTypes = {
  recentRecords: PropTypes.arrayOf(
    PropTypes.shape({
      begin: PropTypes.instanceOf(Date),
      end: PropTypes.instanceOf(Date),
    }),
  ),
};

RecentRecords.defaultProps = {
  recentRecords: [],
};

export default RecentRecords;
