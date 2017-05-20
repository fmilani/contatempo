import { ReactiveDict } from 'meteor/reactive-dict';

const AppSession = new ReactiveDict('app-session');

const AppSessionFields = {
  /**
   * the last selected period on history page
   */
  LAST_HISTORY_PERIOD: 'LAST_HISTORY_PERIOD',
};

export { AppSession, AppSessionFields };
