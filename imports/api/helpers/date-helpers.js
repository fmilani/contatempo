import moment from 'moment';
import EndOfMonthEnum from '../settings/EndOfMonthEnum';

/**
 * Gets the day interval of the given date
 * @param {Date} date - the given date
 * @return {Object} - an object representing the interval with start and end dates
 */
export const getDayInterval = date => {
  const ref = moment(date);

  const start = moment(ref).startOf('day');
  const end = moment(ref).endOf('day');

  return { start, end };
};

/**
 * Gets the week interval of the given date
 * @param {Date} date - the given date
 * @return {Object} - an object representing the interval with start and end dates
 */
export const getWeekInterval = date => {
  const ref = moment(date);

  const start = moment(ref).startOf('week');
  const end = moment(ref).endOf('week');

  return { start, end };
};

/**
 * Gets the month interval of the given date
 * @param {Date} date - the given date
 * @param {String} endOfMonth - indicates when the month ends
 * @return {Object} - an object representing the interval with start and end dates
 */
export const getMonthInterval = (date, endOfMonth) => {
  const endOfMonthValue = EndOfMonthEnum[endOfMonth] || EndOfMonthEnum.LAST_DAY;
  const ref = moment(date);

  const currentMonth =
    endOfMonthValue === EndOfMonthEnum.DAY_20
      ? moment(ref)
          .subtract(20, 'days')
          .add(1, 'month')
      : moment(ref);

  const start =
    endOfMonthValue === EndOfMonthEnum.DAY_20
      ? moment(currentMonth)
          .subtract(1, 'month')
          .date(21)
          .startOf('day')
      : moment(currentMonth).startOf('month');

  const end =
    endOfMonthValue === EndOfMonthEnum.DAY_20
      ? moment(currentMonth)
          .date(20)
          .endOf('day')
      : moment(currentMonth).endOf('month');

  return { start, end };
};

/**
 * Gets the last week interval of the given date
 * @param {Date} date - the given date
 * @return {Object} - an object representing the interval with start and end dates
 */
export const getLastWeekInterval = date => {
  const ref = moment(date);

  const start = moment(ref)
    .subtract(7, 'days')
    .startOf('week');
  const end = moment(ref)
    .subtract(7, 'days')
    .endOf('week');

  return { start, end };
};

/**
 * Gets the last month interval of the given date
 * @param {Date} date - the given date
 * @param {String} endOfMonth - indicates when the month ends
 * @return {Object} - an object representing the interval with start and end dates
 */
export const getLastMonthInterval = (date, endOfMonth) =>
  getMonthInterval(moment(date).subtract(1, 'month'), endOfMonth);

/**
   * Gets a date representing last month relative to given date
   * @param {Date} date - the given date
   * @param {String} endOfMonth - indicates when the month ends
   * @return {Object} - a moment object of the last month
   */
export const getLastMonth = (date, endOfMonth) =>
  endOfMonth === EndOfMonthEnum.DAY_20
    ? moment(date).subtract(20, 'days')
    : moment(date).subtract(1, 'month');

/**
 * Gets the total elapsed time (in ms) for a given list of records and
 * a currentTime (for ongoing records)
 * @param {Array} records the list of records
 * @param {Date} currentTime the current time used for ongoing records
 */
export const getTotalElapsedTime = (records, currentTime) => {
  const finishedRecordsElapsedTime = records
    .filter(record => record.end)
    .map(record => moment(record.end).diff(moment(record.begin)))
    .reduce((l, n) => l + n, 0);

  const ongoingRecordsElapsedTime = records
    .filter(record => !record.end)
    .map(record => moment(currentTime).diff(record.begin))
    .reduce((l, n) => l + n, 0);
  return finishedRecordsElapsedTime + ongoingRecordsElapsedTime;
};
