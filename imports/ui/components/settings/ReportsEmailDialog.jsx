import React from 'react';
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';
import TextField from 'material-ui/TextField';
import { i18n } from 'meteor/universe:i18n';

const isEmailValid = email => email.match(/.+@.+/);

class ReportsEmailDialog extends React.Component {
  constructor(props) {
    super();
    this.state = {
      email: props.email,
      invalidEmailText: '',
    };
    this.onChangeEmail = this.onChangeEmail.bind(this);
    this.resetEmailState = this.resetEmailState.bind(this);
  }

  onChangeEmail(event, newEmail) {
    if (isEmailValid(newEmail)) {
      this.setState({ invalidEmailText: '' });
    } else {
      this.setState({ invalidEmailText: i18n.getTranslation('email.invalid') });
    }
    this.setState({ email: newEmail });
  }

  resetEmailState() {
    this.setState({ email: this.props.email, invalidEmailText: '' });
  }

  render() {
    const props = this.props;
    return (
      <Dialog
        title={i18n.getTranslation('email.type_email')}
        actions={[
          <FlatButton
            label={i18n.getTranslation('common.cancel')}
            onTouchTap={() => {
              this.resetEmailState();
              props.onCancelClick();
            }}
          />,
          <FlatButton
            label={i18n.getTranslation('common.confirm')}
            primary
            onTouchTap={() => {
              if (!isEmailValid(this.state.email)) {
                return;
              }
              props.onConfirmClick(this.state.email);
              props.onRequestClose();
            }}
          />,
        ]}
        modal={false}
        open={props.open}
        onRequestClose={() => {
          this.resetEmailState();
          props.onRequestClose();
        }}
      >
        <TextField
          floatingLabelText="Email"
          fullWidth
          value={this.state.email}
          onChange={this.onChangeEmail}
          errorText={this.state.invalidEmailText}
        />
      </Dialog>
    );
  }
}

ReportsEmailDialog.propTypes = {
  email: React.PropTypes.string,
};

ReportsEmailDialog.defaultProps = {
  email: '',
};

export default ReportsEmailDialog;
