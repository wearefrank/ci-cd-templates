const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { run } = require('../lib/runner');

const danger = {
  github: {
    pr: { title: 'fix: a', user: { login: 'x', type: 'User' } },
    commits: [{ sha: 'a'.repeat(40), commit: { message: 'fix: a' }, parents: [{}] }],
  },
  git: { created_files: ['new.txt'], modified_files: [], deleted_files: [] },
};

async function runWith(projectRules, baseRules) {
  const workspace = fs.mkdtempSync(path.join(os.tmpdir(), 'pr-rules-'));
  if (projectRules) fs.writeFileSync(path.join(workspace, 'rules.js'), projectRules);
  const output = { fail: [], warn: [] };
  await run({
    danger,
    fail: (t) => output.fail.push(t),
    warn: (t) => output.warn.push(t),
    baseRules,
    rulesFile: 'rules.js',
    workspace,
  });
  return output;
}

const baseRule = { id: 'base', run: ({ fail }) => fail('base failed') };

test('base rules run without a project rules file', async () => {
  const output = await runWith(null, [baseRule]);
  assert.deepEqual(output.fail, ['**base**: base failed']);
});

test('project rules are added to the base rules and can use the context', async () => {
  const output = await runWith(
    `module.exports = { rules: [{ id: 'mine', run: ({ files, warn }) => warn('created ' + files.created.join()) }] };`,
    [baseRule],
  );
  assert.deepEqual(output.fail, ['**base**: base failed']);
  assert.deepEqual(output.warn, ['**mine**: created new.txt']);
});

test('base rules can be skipped', async () => {
  const output = await runWith(`module.exports = { skip: ['base', 'unknown'] };`, [baseRule]);
  assert.deepEqual(output.fail, []);
  assert.equal(output.warn.length, 1);
  assert.match(output.warn[0], /unknown/);
});

test('duplicate and invalid rules are reported', async () => {
  const duplicate = await runWith(`module.exports = { rules: [{ id: 'base', run() {} }] };`, [baseRule]);
  assert.match(duplicate.fail[0], /Duplicate rule id/);
  const invalid = await runWith(`module.exports = { rules: [{ id: 'x' }] };`, [baseRule]);
  assert.match(invalid.fail[0], /needs a string/);
});

test('a crashing project rule fails instead of crashing the run', async () => {
  const output = await runWith(`module.exports = { rules: [{ id: 'bad', run() { throw new Error('boom'); } }] };`, []);
  assert.match(output.fail[0], /bad.*boom/);
});
