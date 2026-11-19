import test from 'node:test';
import assert from 'node:assert/strict';
import {
  parseValidTime,
  isValidTime,
  formatDisplayTime,
  compareTimes,
  isEndTimeAfterStartTime,
  DEFAULT_TIME_SUGGESTIONS
} from '../src/utils/timeFormat.ts';

test('Time Parser: Handles valid 12-hour times with AM/PM', () => {
  assert.equal(formatDisplayTime('9:00 AM'), '9:00 AM');
  assert.equal(formatDisplayTime('10:30 AM'), '10:30 AM');
  assert.equal(formatDisplayTime('1:00 PM'), '1:00 PM');
  assert.equal(formatDisplayTime('6:30 PM'), '6:30 PM');
  assert.equal(formatDisplayTime('9:00 PM'), '9:00 PM');
  assert.equal(formatDisplayTime('8:00 AM'), '8:00 AM');
  assert.equal(formatDisplayTime('08:00 AM'), '8:00 AM');
  assert.equal(formatDisplayTime('8:00am'), '8:00 AM');
  assert.equal(formatDisplayTime('12:30 PM'), '12:30 PM');
  assert.equal(formatDisplayTime('11:59 pm'), '11:59 PM');
});

test('Time Parser: Converts valid 24-hour times into 12-hour AM/PM', () => {
  assert.equal(formatDisplayTime('13:00'), '1:00 PM');
  assert.equal(formatDisplayTime('14:30'), '2:30 PM');
  assert.equal(formatDisplayTime('00:00'), '12:00 AM');
  assert.equal(formatDisplayTime('09:15'), '9:15 AM');
  assert.equal(formatDisplayTime('23:45'), '11:45 PM');
});

test('Time Parser: Handles hour-only shortcuts with AM/PM', () => {
  assert.equal(formatDisplayTime('8 AM'), '8:00 AM');
  assert.equal(formatDisplayTime('8pm'), '8:00 PM');
  assert.equal(formatDisplayTime('12 PM'), '12:00 PM');
});

test('Time Parser: Handles time ranges gracefully', () => {
  assert.equal(formatDisplayTime('4:00 PM - 6:00 PM'), '4:00 PM – 6:00 PM');
  assert.equal(formatDisplayTime('9:00 AM to 11:00 AM'), '9:00 AM – 11:00 AM');
  assert.equal(formatDisplayTime('13:00 - 15:00'), '1:00 PM – 3:00 PM');
});

test('Time Parser: Rejects invalid or corrupted times (e.g. 1:ABC, 25:90 PM, 13:00 PM, 99:99)', () => {
  assert.equal(formatDisplayTime('1:ABC'), null);
  assert.equal(isValidTime('1:ABC'), false);
  assert.equal(formatDisplayTime('25:90 PM'), null);
  assert.equal(isValidTime('25:90 PM'), false);
  assert.equal(formatDisplayTime('13:00 PM'), null);
  assert.equal(isValidTime('13:00 PM'), false);
  assert.equal(formatDisplayTime('99:99'), null);
  assert.equal(isValidTime('99:99'), false);
  assert.equal(formatDisplayTime('ABC'), null);
  assert.equal(formatDisplayTime('12:XYZ'), null);
  assert.equal(formatDisplayTime('invalid'), null);
  assert.equal(formatDisplayTime('25:00'), null);
  assert.equal(formatDisplayTime('14:00 PM'), null);
  assert.equal(formatDisplayTime(''), null);
  assert.equal(formatDisplayTime(null), null);
  assert.equal(formatDisplayTime(undefined), null);
});

test('Time Comparison & Order Validation: Chronological order check', () => {
  // 4:00 PM vs 6:00 PM -> 4:00 PM is before 6:00 PM
  assert.equal(compareTimes('4:00 PM', '6:00 PM') < 0, true);
  assert.equal(isEndTimeAfterStartTime('4:00 PM', '6:00 PM'), true);

  // 6:00 PM vs 4:00 PM -> End time before start time is invalid
  assert.equal(compareTimes('6:00 PM', '4:00 PM') > 0, true);
  assert.equal(isEndTimeAfterStartTime('6:00 PM', '4:00 PM'), false);

  // Equal times
  assert.equal(compareTimes('4:00 PM', '4:00 PM'), 0);
  assert.equal(isEndTimeAfterStartTime('4:00 PM', '4:00 PM'), false);

  // Invalid times return null
  assert.equal(compareTimes('1:ABC', '4:00 PM'), null);
});

test('Time Suggestions: Default suggestions are all valid 12-hour strings', () => {
  assert.ok(DEFAULT_TIME_SUGGESTIONS.length > 5);
  for (const sug of DEFAULT_TIME_SUGGESTIONS) {
    assert.ok(isValidTime(sug), `Suggestion "${sug}" must be valid`);
    assert.equal(formatDisplayTime(sug), sug, `Suggestion "${sug}" must be standardized 12h`);
  }
});
