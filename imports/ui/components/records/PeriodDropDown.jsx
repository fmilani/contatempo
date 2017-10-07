import React, { Component } from 'react';
import { withRouter } from 'react-router';
import { i18n } from 'meteor/universe:i18n';
import DropDownMenu from 'material-ui/DropDownMenu';
import MenuItem from 'material-ui/MenuItem';
import { URLS } from '../../../api/helpers/urls.js';
import { AppSession, AppSessionFields } from '../../../session/session';

/**
 * Component for a list of history periods.
 */
class PeriodDropDown extends Component {
  constructor(props) {
    super(props);

    this.onSelectPeriod = this.onSelectPeriod.bind(this);
  }

  onSelectPeriod(event, index, value) {
    AppSession.set(AppSessionFields.LAST_HISTORY_PERIOD, value);
    this.props.router.push(value);
  }

  render() {
    return (
      <DropDownMenu
        style={{ height: '64px' }}
        iconStyle={{ marginTop: '-2px', marginRight: '2px' }}
        underlineStyle={{ display: 'none' }}
        labelStyle={{
          color: 'white',
          fontSize: 20,
          paddingLeft: 0,
          height: '64px',
          lineHeight: '64px',
        }}
        value={this.props.location.pathname}
        onChange={this.onSelectPeriod}
      >
        <MenuItem
          value={URLS.HISTORY.THIS_WEEK}
          primaryText={i18n.getTranslation('period.this_week')}
        />
        <MenuItem
          value={URLS.HISTORY.THIS_MONTH}
          primaryText={i18n.getTranslation('period.this_month')}
        />
        <MenuItem
          value={URLS.HISTORY.LAST_WEEK}
          primaryText={i18n.getTranslation('period.last_week')}
        />
        <MenuItem
          value={URLS.HISTORY.LAST_MONTH}
          primaryText={i18n.getTranslation('period.last_month')}
        />
      </DropDownMenu>
    );
  }
}

PeriodDropDown.propTypes = {
  location: React.PropTypes.shape({
    pathname: React.PropTypes.string,
  }).isRequired,
  router: React.PropTypes.shape({
    push: React.PropTypes.func,
  }).isRequired,
};

export default withRouter(PeriodDropDown);
