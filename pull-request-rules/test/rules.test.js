const test = require('node:test');
const assert = require('node:assert/strict');
const { createContext } = require('../lib/runner');
const baseRules = require('../rules');

function evaluate({ title = 'fix: something', messages = ['fix: something'], user = { login: 'someone', type: 'User' }, rules = baseRules }) {
  const danger = {
    github: {
      pr: { title, user },
      commits: messages.map((message, index) => ({
        sha: `${index}`.padStart(40, 'a'),
        commit: { message },
        parents: [{ sha: 'p' }],
      })),
    },
    git: { created_files: [], modified_files: [], deleted_files: [] },
  };
  const results = [];
  const context = createContext(danger);
  for (const rule of rules) {
    rule.run({
      ...context,
      fail: (text) => results.push({ level: 'fail', ruleId: rule.id, text }),
      warn: (text) => results.push({ level: 'warn', ruleId: rule.id, text }),
    });
  }
  return results;
}

const failedRules = (results) => results.filter((r) => r.level === 'fail').map((r) => r.ruleId);

test('valid title and commits pass all base rules', () => {
  assert.deepEqual(evaluate({}), []);
});

test('invalid PR title fails', () => {
  assert.deepEqual(failedRules(evaluate({ title: 'Update the readme' })), ['conventional-commit-title']);
  assert.deepEqual(failedRules(evaluate({ title: 'WIP: fix: something' })), ['conventional-commit-title']);
});

test('invalid commit fails once', () => {
  assert.deepEqual(failedRules(evaluate({ messages: ['fix: ok', 'update readme'] })), ['conventional-commit-messages']);
});

test('WIP commit is only reported by no-wip-commits', () => {
  assert.deepEqual(failedRules(evaluate({ messages: ['fixup! fix: something'] })), ['no-wip-commits']);
});

test('merge commits are ignored', () => {
  const results = [];
  const danger = {
    github: {
      pr: { title: 'fix: a', user: { login: 'x', type: 'User' } },
      commits: [{ sha: 'a'.repeat(40), commit: { message: "Merge branch 'main' into x" }, parents: [{}, {}] }],
    },
    git: { created_files: [], modified_files: [], deleted_files: [] },
  };
  const context = createContext(danger);
  for (const rule of baseRules) rule.run({ ...context, fail: (t) => results.push(t), warn: (t) => results.push(t) });
  assert.deepEqual(results, []);
});

test('misplaced BREAKING fails and bare ! warns', () => {
  assert.deepEqual(failedRules(evaluate({ messages: ['fix: a\nBREAKING: b'] })), ['breaking-change-footer']);
  const warned = evaluate({ messages: ['feat!: a'] });
  assert.deepEqual(warned.map((r) => [r.level, r.ruleId]), [['warn', 'breaking-change-footer']]);
  assert.deepEqual(evaluate({ messages: ['feat!: a\n\nBREAKING: b'] }), []);
});

test('bare mentions fail in title and commits, but not for bots', () => {
  assert.deepEqual(failedRules(evaluate({ title: 'fix: remove @dabe' })), ['no-bare-mentions']);
  assert.deepEqual(failedRules(evaluate({ messages: ['fix: remove @dabe'] })), ['no-bare-mentions']);
  assert.deepEqual(failedRules(evaluate({ messages: ['fix: remove `@dabe`'] })), []);
  assert.deepEqual(failedRules(evaluate({ title: 'build: bump @types/node', user: { login: 'dependabot[bot]', type: 'Bot' } })), []);
});
