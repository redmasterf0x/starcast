const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const serverFile = path.join(__dirname, '..', 'server.js');
const serverCode = fs.readFileSync(serverFile, 'utf8');

test('server exposes a profile API for member profile persistence', () => {
  assert.match(serverCode, /\/api\/profile/i, 'expected profile route to exist');
  assert.match(serverCode, /user_profiles|profiles/i, 'expected a profile storage table or schema');
});
