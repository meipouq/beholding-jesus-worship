import test from 'node:test';
import assert from 'node:assert/strict';

test('Registration Form: Password matching logic', () => {
  const checkPasswordMatch = (p1, p2) => {
    if (!p1 || !p2) return { match: false, error: 'Password required' };
    if (p1 !== p2) return { match: false, error: 'Passwords do not match. Please ensure both fields are identical.' };
    return { match: true, error: null };
  };

  assert.equal(checkPasswordMatch('secret123', 'secretABC').match, false);
  assert.equal(checkPasswordMatch('secret123', 'secretABC').error, 'Passwords do not match. Please ensure both fields are identical.');
  assert.equal(checkPasswordMatch('secret123', 'secret123').match, true);
  assert.equal(checkPasswordMatch('secret123', 'secret123').error, null);
});

test('Registration Form: Vocal Range visibility role rule', () => {
  const isVocalRole = (role) => role === 'Worship Leader' || role === 'Worship Team Vocalist' || role === 'Vocalist';

  // Allowed to see Vocal Range
  assert.equal(isVocalRole('Worship Leader'), true);
  assert.equal(isVocalRole('Worship Team Vocalist'), true);
  assert.equal(isVocalRole('Vocalist'), true);

  // Hidden for instrumentalists & other roles
  assert.equal(isVocalRole('Acoustic Guitarist'), false);
  assert.equal(isVocalRole('Keyboardist / Pianist'), false);
  assert.equal(isVocalRole('Electric Guitarist'), false);
  assert.equal(isVocalRole('Bass Guitarist'), false);
  assert.equal(isVocalRole('Drummer'), false);
  assert.equal(isVocalRole('Sound & Multimedia'), false);
});
