import moment from 'moment';

export function isValidEdition(record, editedDate, field) {
  let validEdition;
  if (field === 'begin') {
    validEdition =
      !record.end || moment(editedDate).isBefore(moment(record.end));
  } else {
    validEdition = moment(editedDate).isAfter(moment(record.begin));
  }

  return validEdition;
}

export function isValidInsertion(begin, end) {
  return moment(end).isAfter(moment(begin));
}
