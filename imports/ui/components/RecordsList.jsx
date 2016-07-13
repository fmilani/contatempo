import React from 'react';
import moment from 'moment';
import { i18n } from 'meteor/universe:i18n';
import {Table, TableBody, TableHeader, TableHeaderColumn, TableRow, TableRowColumn}
  from 'material-ui/Table';

/**
 * Shows time records in a table (yes, not a list).
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

  // formats a record time with the hours, minutes and seconds (HH:mm:ss)
  formatRecordTime(recordTime) {
    return recordTime ? moment(recordTime).format('HH:mm:ss') : '...';
  }

  render() {
    return (
      <Table selectable={false}>
        <TableHeader adjustForCheckbox={false} displaySelectAll={false}>
          <TableRow>
            <TableHeaderColumn
              colSpan="2"
              tooltip={this.t('records_tooltip')}
              style={{textAlign: 'center'}}
            >
              {this.t('records')}
            </TableHeaderColumn>
          </TableRow>
          <TableRow>
            <TableHeaderColumn
              style={{textAlign: 'center'}}
              tooltip={this.t('begin_tooltip')}
            >
              {this.t('begin')}
            </TableHeaderColumn>
            <TableHeaderColumn
              style={{textAlign: 'center'}}
              tooltip={this.t('end_tooltip')}
            >
              {this.t('end')}
            </TableHeaderColumn>
          </TableRow>
        </TableHeader>
        <TableBody displayRowCheckbox={false}>
          {this.props.records.map( (record, index) => (
            <TableRow key={index}>
              <TableRowColumn style={{ textAlign: 'center' }}>
                {this.formatRecordTime(record.begin)}
              </TableRowColumn>
              <TableRowColumn style={{ textAlign: 'center' }}>
                {this.formatRecordTime(record.end)}
              </TableRowColumn>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    );
  }
}

RecordsList.propTypes = {
  records: React.PropTypes.array,
};
