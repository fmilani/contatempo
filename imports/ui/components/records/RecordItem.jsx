import React from 'react';
import { remove } from '../../../api/records/methods.js';
import RecordTime from './RecordTime.jsx';
import IconButton from 'material-ui/IconButton';
import ActionDelete from 'material-ui/svg-icons/action/delete';
import Divider from 'material-ui/Divider';

export default class RecordItem extends React.Component {

  removeRecord(id) {
    remove.call({ id });
  }

  render() {
    const { record } = this.props;
    const grey500 = '#9E9E9E'; // TODO: use palette (grey500)

    return (
      <div>
        <Divider />
        <div style={{ display: 'flex' }}>
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
      </div>
    );
  }
}

RecordItem.propTypes = {
  record: React.PropTypes.object,
};
