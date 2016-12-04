import { Meteor } from 'meteor/meteor';
import { Email } from 'meteor/email';
import React from 'react';
import { renderToString } from 'react-dom/server';
import moment from 'moment';

// TODO: split this file (maybe generate email template somewhere else?)
const sendReportEmail = ({ userName, monthString, records }) => {
  // prevent calling Email method from client-side
  if (!Meteor.isServer) return;

  let totalTime = records
    .map(record => moment(record.end).diff(moment(record.begin)))
    .reduce((l, n) => l + n, 0);
  totalTime = totalTime / 1000 / 60 / 60;
  totalTime = Math.round(totalTime * 100) / 100;
  // TODO: add i18n to email sent (including date formats)

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

  console.log(`Sending ${userName} report to ${process.env.REPORTS_MAIL}`);

  Email.send({
    from: 'Contatempo@contatempo.com',
    to: [process.env.REPORTS_MAIL, process.env.REPORTS_MAIL_2],
    subject: `Relatório de horas - ${userName} - ${monthString}`,
    html: renderToString(
      <div>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, user-scalable=no" />
        <title />
        <div style={{ maxWidth: 600, margin: '0px auto', backgroundColor: 'white', padding: 10 }}>
          <p>
            Total de horas trabalhadas:
            <strong style={{ fontSize: 26 }}>{totalTime}</strong>
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
                records.map((record, index) => (
                  <tr key={index}>
                    <td style={rowsStyle}>{moment(record.begin).format('DD/MM')}</td>
                    <td style={rowsStyle}>{moment(record.begin).format('HH:mm')}</td>
                    <td style={rowsStyle}>{moment(record.end).format('HH:mm')}</td>
                  </tr>
                ))
              }
            </tbody>
          </table>
        </div>
      </div>,
    ),
  });
};

export default sendReportEmail;
