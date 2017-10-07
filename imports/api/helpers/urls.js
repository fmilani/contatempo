const HISTORY_ROOT = '/history';

/**
 * Urls used on the project.
 */
export const URLS = {
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

/**
 * Checks if a path correspond to a history page.
 *
 * @param {String} path the path to be checked
 */
export const isAHistoryPage = path =>
  `/${path.split('/')[1]}` === URLS.HISTORY.ROOT;

/**
 * Checks if a path correspond to the last month history page.
 * @param {String} path the path to be checked
 */
export const isLastMonthHistoryPage = path => path === URLS.HISTORY.LAST_MONTH;
