import { Meteor } from 'meteor/meteor';
import { chai } from 'meteor/practicalmeteor:chai';
import { describe, it } from 'meteor/practicalmeteor:mocha';
import EndOfMonthEnum from '../settings/EndOfMonthEnum';

import { getDayInterval, getMonthInterval } from './date-helpers';

const chaiDatetime = require('chai-datetime');

if (Meteor.isServer) {
  chai.use(chaiDatetime);
  const expect = chai.expect;

  describe('date-helpers', () => {
    describe('getDayInterval', () => {
      // jan 18, 2016 00:00:00.000
      const expectedStart = new Date(2016, 0, 18, 0, 0, 0, 0);
      // jan 18, 2016 23:59:59.999
      const expectedEnd = new Date(2016, 0, 18, 23, 59, 59, 999);

      it('should return the correct start and the end of a given day', () => {
        // jan 18, 2016 04:56:16.123
        const testDate = new Date(2016, 0, 18, 4, 56, 16, 123);

        const { start, end } = getDayInterval(testDate);

        expect(start.toDate()).to.equalTime(expectedStart);
        expect(end.toDate()).to.equalTime(expectedEnd);
      });
      it('should return the correct start and the end of a given start of day', () => {
        const testDate = new Date(2016, 0, 18, 0, 0, 0, 0);

        const { start, end } = getDayInterval(testDate);

        expect(start.toDate()).to.equalTime(expectedStart);
        expect(end.toDate()).to.equalTime(expectedEnd);
      });
      it('should return the correct start and the end of a given end of day', () => {
        const testDate = new Date(2016, 0, 18, 0, 0, 0, 0);

        const { start, end } = getDayInterval(testDate);

        expect(start.toDate()).to.equalTime(expectedStart);
        expect(end.toDate()).to.equalTime(expectedEnd);
      });
    });

    describe('getMonthInterval', () => {
      const test = (endOfMonth, testDate, expectedStart, expectedEnd) => {
        const { start, end } = getMonthInterval(testDate, endOfMonth);

        expect(start.toDate()).to.equalTime(expectedStart);
        expect(end.toDate()).to.equalTime(expectedEnd);
      };

      describe('end of month is on day 20', () => {
        // dec 21, 2016 00:00:00.000
        const expectedStart = new Date(2016, 11, 21, 0, 0, 0, 0);
        // jan 20, 2017 23:59:59.999
        const expectedEnd = new Date(2017, 0, 20, 23, 59, 59, 999);

        const endOfMonth = EndOfMonthEnum.DAY_20;

        it('should return the correct start and end of the month of a given date', () => {
          // jan 05, 2017 13:14:15.678
          const testDate = new Date(2017, 0, 5, 13, 14, 15, 678);

          test(endOfMonth, testDate, expectedStart, expectedEnd);
        });
        it('should return the correct start and end of the month of a given start of month', () => {
          // dec 21, 2016 00:00:00.000
          const testDate = new Date(2016, 11, 21, 0, 0, 0, 0);

          test(endOfMonth, testDate, expectedStart, expectedEnd);
        });
        it('should return the correct start and end of the month of a given end of month', () => {
          // jan 20, 2017 23:59:59.999
          const testDate = new Date(2017, 0, 20, 23, 59, 59, 999);

          test(endOfMonth, testDate, expectedStart, expectedEnd);
        });
      });

      describe('end of month is on last day', () => {
        // feb 01, 2016 00:00:00.000
        const expectedStart = new Date(2016, 1, 1, 0, 0, 0, 0);
        // feb 29, 2016 23:59:59.999
        const expectedEnd = new Date(2016, 1, 29, 23, 59, 59, 999);

        const endOfMonth = EndOfMonthEnum.LAST_DAY;

        it('should return the correct start and end of the month of a given date', () => {
          // feb 5, 2016 13:14:15.678
          const testDate = new Date(2016, 1, 5, 13, 14, 15, 678);

          test(endOfMonth, testDate, expectedStart, expectedEnd);
        });
        it('should return the correct start and end of the month of a given start of month', () => {
          // feb 01, 2016 00:00:00.000
          const testDate = new Date(2016, 1, 1, 0, 0, 0, 0);

          test(endOfMonth, testDate, expectedStart, expectedEnd);
        });
        it('should return the correct start and end of the month of a given end of month', () => {
          // feb 29, 2016 23:59:59.999
          const testDate = new Date(2016, 1, 29, 23, 59, 59, 999);

          test(endOfMonth, testDate, expectedStart, expectedEnd);
        });
      });
    });
  });
}
