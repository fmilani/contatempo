import { Meteor } from 'meteor/meteor';
import { chai } from 'meteor/practicalmeteor:chai';
import { describe, it } from 'meteor/practicalmeteor:mocha';

import { isValidInsertion, isValidEdition } from './helpers';

if (Meteor.isServer) {
  const expect = chai.expect;
  const getValidRecord = () => ({
    begin: new Date(2017, 0, 29, 21, 0, 0, 0),
    end: new Date(2017, 0, 29, 21, 0, 0, 15),
  });
  const getInvalidRecord = () => ({
    begin: new Date(2017, 0, 29, 21, 0, 0, 30),
    end: new Date(2017, 0, 29, 21, 0, 0, 15),
  });
  describe('records/helpers', () => {
    describe('isValidInsertion', () => {
      it('should return true when record\'s end is after its begin', () => {
        const record = getValidRecord();

        expect(isValidInsertion(record.begin, record.end)).to.equal(true);
      });

      it('should return false when record\'s end is before its begin', () => {
        const record = getInvalidRecord();

        expect(isValidInsertion(record.begin, record.end)).to.equal(false);
      });
    });
    describe('isValidEdition', () => {
      describe('when the field being edited is the begin of the record', () => {
        it('should return true when record\'s end is after new begin', () => {
          const record = getValidRecord();

          expect(isValidEdition(record, record.begin, 'begin')).to.equal(true);
        });

        it('should return false when record\'s end is before new begin', () => {
          const record = getInvalidRecord();

          expect(isValidEdition(record, record.begin, 'begin')).to.equal(false);
        });

        it('should return true when record has no end field set', () => {
          const record = getValidRecord();
          record.end = null;

          expect(isValidEdition(record, record.begin, 'begin')).to.equal(true);
        });
      });
      describe('when the field being edited is the end of the record', () => {
        it('should return true when record\'s begin is before new end', () => {
          const record = getValidRecord();

          expect(isValidEdition(record, record.end, 'end')).to.equal(true);
        });

        it('should return false when record\'s begin is after new end', () => {
          const record = getInvalidRecord();

          expect(isValidEdition(record, record.end, 'end')).to.equal(false);
        });
      });
    });
  });
}
