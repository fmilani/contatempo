import { Meteor } from 'meteor/meteor';
import { Email } from 'meteor/email';
import reportEmail from './report-email.jsx';

const sendReportEmail = ({
  userName,
  userReportsEmail,
  userTimezone,
  monthString,
  records,
  interval,
}) => {
  // prevent calling Email method from client-side
  if (!Meteor.isServer) return;

  console.log(`Sending ${userName} report to ${userReportsEmail}`);

  Email.send({
    from: 'Contatempo@contatempo.com',
    to: [userReportsEmail],
    subject: `Relatório de horas - ${userName} - ${monthString}`,
    html: reportEmail({ userName, userTimezone, records, interval }),
  });
};

export default sendReportEmail;
