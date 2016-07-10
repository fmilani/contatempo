import { Meteor } from 'meteor/meteor';
import { Email } from 'meteor/email'
// import React from 'react';
// import ReactDOMServer from 'react-dom/server';
// import RecordsList from '../ui/components/RecordsList.jsx';
// import moment from 'moment';
// import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
// import getMuiTheme from 'material-ui/styles/getMuiTheme';

Meteor.methods({
  'sendEmail'(to, from, subject, content) {
    // TODO: rendering a material-ui component is not working properly
    // (inline styles are missing from the email sent to google inbox)
    // Also translations are not being made
    
    // check([to, from, subject, content], [String]);

    // Let other method calls from the same client start running,
    // without waiting for the email sending to complete.
    // this.unblock();
    //
    // Email.send({
    //   to: 'felmilani@gmail.com',
    //   from: 'fmilani@contatempo.com',
    //   subject: 'Relatório de horas - Felipe Milani',
    //   html: ReactDOMServer.renderToString(
    //     <MuiThemeProvider muiTheme={getMuiTheme(null, {userAgent: 'all'})}>
    //       <RecordsList records={records}/>
    //     </MuiThemeProvider>
    //   ),
    //   attachments: [{
    //     fileName: 'flapjacks.pdf',
    //     filePath: 'https://s3.amazonaws.com/tmc-post-content/flapjacks.pdf',
    //     contentType: 'pdf',
    //   }],
    // });
  }
});
