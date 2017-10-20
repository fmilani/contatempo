import React from 'react';
import { renderToString } from 'react-dom/server';
import moment from 'moment';

const headersStyle = {
  fontSize: 14,
  fontWeight: 'bold',
  borderBottom: '1px solid rgba(0,0,0,.11)',
  borderRight: '3px solid #fff',
  borderLeft: '3px solid #fff',
  color: 'rgba(0,0,0,.51)',
  minWidth: 100,
  textAlign: 'left',
  padding: 15,
};

const rowsStyle = {
  fontSize: 12,
  borderColor: '#999',
  color: '#444',
  minWidth: 100,
  padding: 15,
};

// TODO: add i18n to email sent (including date formats)
const reportEmail = ({ userName, userTimezone, records, interval }) => {
  let totalTime = records
    .map(record => moment(record.end).diff(moment(record.begin)))
    .reduce((l, n) => l + n, 0);
  totalTime = totalTime / 1000 / 60 / 60;
  totalTime = Math.round(totalTime * 100) / 100;
  return renderToString(
    <div
      style={{
        backgroundColor: '#f5f5f5',
        fontFamily: 'Helvetica Neue,Helvetica,Arial,sans-serif',
        padding: '20px 0',
      }}
    >
      <meta charSet="utf-8" />
      <meta name="viewport" content="width=device-width, user-scalable=no" />
      <div
        style={{
          maxWidth: 600,
          margin: '0px auto',
          color: '#444',
          border: '1px solid #e1e1e1',
        }}
      >
        <div
          style={{
            padding: '35px 0',
            textAlign: 'center',
            backgroundColor: '#FFFFFF',
            fontSize: 26,
            fontWeight: 'bold',
            color: '#3F51B5',
          }}
        >
          Contatempo
        </div>
        <div
          style={{
            backgroundColor: '#3F51B5',
            padding: '25px 0',
            textAlign: 'center',
            color: '#FFFFFF',
            fontSize: 24,
            fontWeight: 'bold',
          }}
        >
          Relatório de horas
          <br />
          <span style={{ fontSize: 18 }}>{userName}</span>
        </div>
        <div
          style={{
            backgroundColor: '#FFFFFF',
            padding: 50,
          }}
        >
          <p>
            Período contabilizado:
            <span
              style={{
                fontWeight: 'bold',
                fontSize: 20,
                color: '#3F51B5',
              }}
            >
              {' '}
              {interval.start}{' '}
            </span>
            à
            <span
              style={{
                fontWeight: 'bold',
                fontSize: 20,
                color: '#3F51B5',
              }}
            >
              {' '}
              {interval.end}
            </span>
          </p>
          <p style={{ marginTop: 20 }}>
            Total de horas trabalhadas:
            <span
              style={{
                fontWeight: 'bold',
                fontSize: 20,
                color: '#3F51B5',
              }}
            >
              {' '}
              {totalTime}
            </span>
          </p>
          <p style={{ marginTop: 50 }}>
            Abaixo seguem os detalhes dessas horas:
          </p>
          <table
            style={{
              borderCollapse: 'collapse',
              borderColor: '#999',
              margin: '40px auto',
            }}
          >
            <thead>
              <tr>
                <th style={headersStyle}>Data</th>
                <th style={headersStyle}>Entrada</th>
                <th style={headersStyle}>Saída</th>
              </tr>
            </thead>
            <tbody>
              {records.map((record, index) => (
                <tr key={index}>
                  <td style={rowsStyle}>
                    {moment(record.begin)
                      .tz(userTimezone)
                      .format('DD/MM/YY')}
                  </td>
                  <td style={rowsStyle}>
                    {moment(record.begin)
                      .tz(userTimezone)
                      .format('HH:mm:ss')}
                  </td>
                  <td style={rowsStyle}>
                    {moment(record.end)
                      .tz(userTimezone)
                      .format('HH:mm:ss')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>,
  );
};

export default reportEmail;
