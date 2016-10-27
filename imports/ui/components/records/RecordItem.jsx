import React from 'react';
import { remove } from '../../../api/records/methods.js';
import RecordTime from './RecordTime.jsx';
import IconButton from 'material-ui/IconButton';
import ActionDelete from 'material-ui/svg-icons/action/delete';

/**
 * Component that shows a record, with its begin and end times.
 */
export default class RecordItem extends React.Component {

  removeRecord(id) {
    remove.call({ id });
  }

  render() {
    const { record } = this.props;
    const grey500 = '#9E9E9E'; // TODO: use palette (grey500)

    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
        <RecordTime type="begin" record={record} />
        <RecordTime type="end" record={record} />
        <div style={{ flex: '0 0 20%', textAlign: 'center' }}>
          <IconButton
            onClick={() => { this.removeRecord(record._id); }}
            iconStyle={{ color: grey500, width: '20px', height: '20px' }}
          >
            <ActionDelete />
          </IconButton>
        </div>
      </div>
    );
  }
}

RecordItem.propTypes = {
  record: React.PropTypes.object,
};
