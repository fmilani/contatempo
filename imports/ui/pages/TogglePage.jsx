import React from 'react';
import moment from 'moment';
import { withRouter } from 'react-router';
import { URLS } from '../../api/helpers/urls.js';
import { toggle } from '../../api/records/methods.js';

/**
 * Component to display the user's history of records
 */
class TogglePage extends React.Component {
  componentDidMount() {
    toggle.call({
      time: moment()
        .startOf('seconds')
        .toDate(),
    });
    this.props.router.replace(URLS.ROOT);
  }

  render() {
    return null;
  }
}

export default withRouter(TogglePage);
