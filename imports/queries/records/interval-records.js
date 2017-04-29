/**
 * Query used to search for records that begin in a given interval
 */
const intervalRecords = ({ start, end }, sort = -1) => ({
  find: {
    begin: {
      $gte: start,
      $lte: end,
    },
  },
  options: {
    sort: { begin: sort },
  },
});

export default intervalRecords;
