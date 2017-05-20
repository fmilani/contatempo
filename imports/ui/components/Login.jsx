import React from 'react';
import { withRouter } from 'react-router';
import { Meteor } from 'meteor/meteor';
import FlatButton from 'material-ui/FlatButton';

class Login extends React.Component {
  constructor(props) {
    super(props);

    // bindings
    this.login = this.login.bind(this);
  }

  login(service) {
    const options = {
      requestPermissions: ['email'],
    };

    Meteor[`loginWith${service}`](options, error => {
      if (error) {
        // TODO: add proper logging
        console.log(error.message);
      } else {
        const { location } = this.props;
        if (location.state && location.state.nextPathname) {
          this.props.router.push(location.state.nextPathname);
        } else {
          this.props.router.push('/');
        }
      }
    });
  }

  render() {
    const bgColor = '#F44336';
    const hoverBgColor = '#D32F2F';
    return (
      <div style={{ textAlign: 'center', margin: '30px 0' }}>
        <FlatButton
          icon={<i className="mdi mdi-google" />}
          style={{
            color: '#fff',
          }}
          backgroundColor={bgColor}
          hoverColor={hoverBgColor}
          label="Login with Google"
          onClick={() => this.login('Google')}
        />
      </div>
    );
  }
}

Login.propTypes = {
  location: React.PropTypes.shape({
    state: React.PropTypes.shape({
      nextPathname: React.PropTypes.string,
    }),
  }).isRequired,
  router: React.PropTypes.shape({
    push: React.PropTypes.func,
  }).isRequired,
};

export default withRouter(Login);
