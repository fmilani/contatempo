import { Meteor } from 'meteor/meteor';
import moment from 'moment';
import Records from '../../records/records.js';
import { getMonthInterval } from '../../helpers/date-helpers.js';
import EndOfMonthEnum from '../../settings/EndOfMonthEnum';
import sendReportEmail from '../../email/send-report-email.jsx';

const sendReports = (date, endOfMonth) => {
  const endOfMonthValue = EndOfMonthEnum[endOfMonth] || EndOfMonthEnum.LAST_DAY;
  console.log(`Sending reports to users with end of month ${endOfMonthValue}`);

  // the method generate reports based on previous day
  const actualDate = moment(date).subtract(1, 'day');
  const monthString = actualDate.format('MMMM');
  const interval = getMonthInterval(actualDate, endOfMonthValue);
  console.log(`
    The reports will include records starting
    from: ${interval.start.format('DD/MM/YYYY')}
    to: ${interval.end.format('DD/MM/YYYY')}
  `);
  const results = Records.aggregate([
    {
      $match: {
        begin: {
          $gte: interval.start.toDate(),
          $lte: interval.end.toDate(),
        },
      },
    },
    {
      $sort: { begin: 1 },
    },
    {
      $group: {
        _id: '$userId',
        records: {
          $push: {
            begin: '$begin',
            end: '$end',
          },
        },
      },
    },
  ]);
  const aggregatedRecords = results
    .filter(
      result =>
        // get only users with the endOfMonthValue setting
        Meteor.users.findOne(result._id).settings.endOfMonth ===
        endOfMonthValue,
    )
    .map(result => {
      const user = Meteor.users.findOne(result._id);

      return {
        userName: user.profile.name,
        userReportsEmail: user.settings.reportsEmail,
        userTimezone: user.settings.timezone,
        userEmail: user.profile.email,
        records: result.records,
        interval: {
          start: interval.start.format('DD/MM/YYYY'),
          end: interval.end.format('DD/MM/YYYY'),
        },
      };
    });

  console.log(`${aggregatedRecords.length} users will receive their reports`);
  aggregatedRecords.forEach(aggregatedRecord => {
    sendReportEmail({ ...aggregatedRecord, monthString });
  });
};

export default sendReports;
