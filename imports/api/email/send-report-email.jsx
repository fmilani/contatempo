import { Meteor } from "meteor/meteor";
import { Email } from "meteor/email";
import reportEmail from "./report-email.jsx";

const sendReportEmail = ({
  userName,
  userReportsEmail,
  userTimezone,
  monthString,
  records,
  sendCopyToUser,
  userEmail,
  interval,
}) => {
  // prevent calling Email method from client-side
  if (!Meteor.isServer) return;

  console.log(
    `Sending ${userName} report to ${userReportsEmail}. ${
      sendCopyToUser ? `Also sending a copy to them (to ${userEmail}). ` : ""
    }`
  );

  const recipientEmails = userReportsEmail.split(/, *|; */);
  if (sendCopyToUser && userEmail !== userReportsEmail) {
    recipientEmails.push(userEmail);
  }

  Email.send({
    from: "felmilani@gmail.com",
    to: recipientEmails,
    subject: `Relatório de horas - ${userName} - ${monthString}`,
    html: reportEmail({ userName, userTimezone, records, interval }),
  });
};

export default sendReportEmail;
