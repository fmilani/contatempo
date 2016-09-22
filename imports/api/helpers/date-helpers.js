import moment from 'moment';

/**
 * Gets the day interval of the given date
 * @param {Date} date - the given date
 * @return {Object} - an object representing the interval with start and end dates
 */
export const getDayInterval = (date) => {
  const ref = moment(date);

  const start = moment(ref).startOf('day');
  const end = moment(ref).endOf('day');

  return { start, end };
};

/**
 * Gets the month interval of the given date
 * @param {Date} date - the given date
 * @return {Object} - an object representing the interval with start and end dates
 */
export const getMonthInterval = (date) => {
  const ref = moment(date);
  const currentMonth = moment(ref).subtract(20, 'days').add(1, 'month')
    .month();
  const start = moment(ref).month(currentMonth - 1).date(21)
    .startOf('day');
  const end = moment(ref).month(currentMonth).date(20)
    .endOf('day');

  return { start, end };
};
