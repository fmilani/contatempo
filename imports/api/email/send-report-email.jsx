import { Meteor } from 'meteor/meteor';
import { Email } from 'meteor/email';
import reportEmail from './report-email.jsx';

// TODO: split this file (maybe generate email template somewhere else?)
const sendReportEmail = ({
  userName,
  userTimezone,
  monthString,
  records,
  interval,
}) => {
  // prevent calling Email method from client-side
  if (!Meteor.isServer) return;

  console.log(
    `Sending ${userName} report to ${Meteor.settings.private.reportsMail}`,
  );

  Email.send({
    from: 'Contatempo@contatempo.com',
    to: [
      Meteor.settings.private.reportsMail,
      Meteor.settings.private.reportsMail2,
    ],
    subject: `Relatório de horas - ${userName} - ${monthString}`,
    html: reportEmail({ userName, userTimezone, records, interval }),
  });
};

export default sendReportEmail;
