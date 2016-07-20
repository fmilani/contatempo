import React from 'react';
import { i18n } from 'meteor/universe:i18n';
import { List } from 'material-ui/List';
import RecordItem from './RecordItem.jsx';

/**
 * Shows time records in a list.
 *
 * @prop {Object[]} records - the time records to be shown
 * @prop {Object} records[].begin - the begin of the time record (a record time)
 * @prop {Object} records[].end - the end of the time record (a record time)
 */
export default class RecordsList extends React.Component {

  constructor(props) {
    super(props);

    this.t = i18n.createTranslator('records');
  }

  render() {
    const grey500 = '#9E9E9E'; // TODO: use palette (grey500)
    return (
      <div>
        <List>
          <div style={{ display: 'flex', margin: '15px 0px', color: grey500, fontSize: '12px' }}>
            <div style={{ flex: '0 0 40%', textAlign: 'center' }}>
              {this.t('begin')}
            </div>
            <div style={{ flex: '0 0 40%', textAlign: 'center' }}>
              {this.t('end')}
            </div>
          </div>
          {this.props.records.map((record, index) => (
            <RecordItem key={index} record={record} />
          ))}
        </List>
      </div>
    );
  }
}

RecordsList.propTypes = {
  records: React.PropTypes.array,
};
