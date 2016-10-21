import { Meteor } from 'meteor/meteor';
import { Email } from 'meteor/email';
import React from 'react';
import { renderToString } from 'react-dom/server';
import moment from 'moment';
import Records from '../../records/records.js';
import { getMonthInterval } from '../../helpers/date-helpers.js';
import EndOfMonthEnum from '../../settings/EndOfMonthEnum';

// TODO: split this file (maybe generate email template somewhere else?)
export const sendReports = (date, endOfMonth) => {
  const endOfMonthValue = EndOfMonthEnum[endOfMonth] || EndOfMonthEnum.LAST_DAY;
  console.log(`Sending reports to users with end of month ${endOfMonthValue}`);

  // the method generate reports based on previous day
  const actualDate = moment(date).subtract(1, 'day');
  const monthString = actualDate.format('MMMM');
  const interval = getMonthInterval(actualDate, endOfMonthValue);
  console.log(`
    The reports will include records starting
    from: ${interval.start.format('DD/MM')}
    to: ${interval.end.format('DD/MM')}
  `);
  const results = Records.aggregate([{
    $match: {
      begin: {
        $gte: interval.start.toDate(),
        $lte: interval.end.toDate(),
      },
    },
  }, {
    $sort: { begin: 1 },
  }, {
    $group: {
      _id: '$userId',
      records: {
        $push: {
          begin: '$begin',
          end: '$end',
        },
      },
    },
  }]);
  const aggregatedRecords = results
    .filter(result =>
      // get only users with the endOfMonthValue setting
      Meteor.users.findOne(result._id).settings.endOfMonth === endOfMonthValue)
    .map(result => {
      const user = Meteor.users.findOne(result._id);
      let totalTime = result.records
        .map(record => moment(record.end).diff(moment(record.begin)))
        .reduce((l, n) => l + n, 0);
      totalTime = totalTime / 1000 / 60 / 60;
      totalTime = Math.round(totalTime * 100) / 100;
      return {
        userName: user.profile.name,
        userEmail: user.profile.email,
        // TODO: format according to language
        records: result.records.map(record => ({
          day: moment(record.begin).format('DD/MM'),
          begin: moment(record.begin).format('HH:mm'),
          end: moment(record.end).format('HH:mm'),
        })),
        totalTime,
      };
    });

  console.log(`${aggregatedRecords.length} users will receive their reports`);
  aggregatedRecords.forEach(aggregatedRecord => {
    // TODO: add i18n to email sent
    const headersStyle = {
      fontSize: 14,
      fontWeight: 'bold',
      padding: '10px 5px',
      borderStyle: 'solid',
      borderWidth: 1,
      overflow: 'hidden',
      wordBreak: 'normal',
      borderColor: '#999',
      color: '#fff',
      backgroundColor: '#26ADE4',
      textAlign: 'center',
      verticalAlign: 'top',
    };

    const rowsStyle = {
      fontSize: 12,
      padding: '10px 5px',
      borderStyle: 'solid',
      borderWidth: 1,
      overflow: 'hidden',
      wordBreak: 'normal',
      borderColor: '#999',
      color: '#444',
      backgroundColor: '#F7FDFA',
      textAlign: 'center',
      verticalAlign: 'top',
    };
    console.log(`Sending ${aggregatedRecord.userName} report to ${process.env.REPORTS_MAIL}`);
    Email.send({
      from: 'Contatempo@contatempo.com',
      to: [process.env.REPORTS_MAIL, process.env.REPORTS_MAIL_2],
      subject: `Relatório de horas - ${aggregatedRecord.userName} - ${monthString}`,
      html: renderToString(
        <div>
          <meta charSet="utf-8" />
          <meta name="viewport" content="width=device-width, user-scalable=no" />
          <title />
          <div style={{ maxWidth: 600, margin: '0px auto', backgroundColor: 'white', padding: 10 }}>
            <p>
              Total de horas trabalhadas:
              <strong style={{ fontSize: 26 }}>{aggregatedRecord.totalTime}</strong>
            </p>
            <table
              style={{
                borderCollapse: 'collapse',
                borderSpacing: 0,
                borderColor: '#999',
                margin: '0px auto',
              }}
            >
              <tbody>
                <tr>
                  <th style={headersStyle}>Dia</th>
                  <th style={headersStyle}>Entrada</th>
                  <th style={headersStyle}>Saída</th>
                </tr>
                {
                  aggregatedRecord.records.map((record, index) => (
                    <tr key={index}>
                      <td style={rowsStyle}>{record.day}</td>
                      <td style={rowsStyle}>{record.begin}</td>
                      <td style={rowsStyle}>{record.end}</td>
                    </tr>
                  ))
                }
              </tbody>
            </table>
          </div>
        </div>
      ),
    });
  });
};
