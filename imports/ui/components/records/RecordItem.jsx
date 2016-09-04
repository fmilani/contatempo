import React from 'react';
import { remove } from '../../../api/records/methods.js';
import RecordTime from './RecordTime.jsx';
import IconButton from 'material-ui/IconButton';
import ActionDelete from 'material-ui/svg-icons/action/delete';
import Chip from 'material-ui/Chip';
import Divider from 'material-ui/Divider';
import { i18n } from 'meteor/universe:i18n';
import moment from 'moment';

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
      <div>
        <Divider />
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
          {
            this.props.displayDay ? (
              <div style={{ flex: '0 0 20%' }}>
                <Chip
                  labelStyle={{ fontSize: '10px', width: '100%', textAlign: 'center' }}
                  style={{ width: '100%' }}
                >
                  {i18n.getTranslation('records.day')} {moment(record.begin).format('D')}
                </Chip>
              </div>
            ) : null
          }
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
  displayDay: React.PropTypes.bool,
  record: React.PropTypes.object,
};
