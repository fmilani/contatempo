const HISTORY_ROOT = '/history';

const URLS = {
  ROOT: '/',
  LOGIN: '/login',
  NOW: '/now',
  SETTINGS: '/settings',
  HISTORY: {
    ROOT: HISTORY_ROOT,
    THIS_WEEK: `${HISTORY_ROOT}/this_week`,
    THIS_MONTH: `${HISTORY_ROOT}/this_month`,
    LAST_WEEK: `${HISTORY_ROOT}/last_week`,
    LAST_MONTH: `${HISTORY_ROOT}/last_month`,
  },
};

export default URLS;
