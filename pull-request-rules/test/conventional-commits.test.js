const test = require('node:test');
const assert = require('node:assert/strict');
const { parse, isWip, findBareMentions } = require('../lib/conventional-commits');

test('parse recognizes conventional headers', () => {
  const parsed = parse('feat(api)!: add endpoint');
  assert.equal(parsed.type, 'feat');
  assert.equal(parsed.scope, 'api');
  assert.equal(parsed.description, 'add endpoint');
  assert.ok(parsed.wellFormed && parsed.knownType && parsed.hasBreakingMark && parsed.breaking);
});

test('parse rejects non conventional headers and unknown types', () => {
  assert.equal(parse('Update readme').wellFormed, false);
  assert.equal(parse('fix:no space').wellFormed, false);
  assert.equal(parse('Feat: uppercase').wellFormed, false);
  const unknown = parse('feature: something');
  assert.ok(unknown.wellFormed);
  assert.equal(unknown.knownType, false);
});

test('parse accepts BREAKING in the footer, also followed by other trailers', () => {
  const parsed = parse('fix: a\n\nbody\n\nBREAKING: removed property\nCo-authored-by: Someone <a@b.c>');
  assert.deepEqual(parsed.breakingNotes, ['BREAKING: removed property']);
  assert.deepEqual(parsed.misplacedBreakingNotes, []);
});

test('parse flags BREAKING outside the footer', () => {
  assert.equal(parse('fix: a\n\nBREAKING: x\n\nmore text').misplacedBreakingNotes.length, 1);
  assert.equal(parse('fix: a\nBREAKING: x').misplacedBreakingNotes.length, 1);
  assert.equal(parse('fix: a\n\nBREAKING CHANGE: x').misplacedBreakingNotes.length, 0);
});

test('isWip detects work-in-progress commits', () => {
  for (const header of ['wip', 'WIP: stuff', 'feat: wip', 'fixup! feat: a', 'squash! x', 'fix typo', 'fix: typo', 'chore: [wip]']) {
    assert.ok(isWip(header), header);
  }
  for (const header of ['feat: add wipe endpoint', 'docs: fix typo in installation guide', 'fix: handle empty response']) {
    assert.equal(isWip(header), false, header);
  }
});

test('findBareMentions finds only unquoted mentions', () => {
  assert.deepEqual(findBareMentions('fix: remove @dabe from AfasEmployee'), ['@dabe']);
  assert.deepEqual(findBareMentions('fix: remove `@dabe` from AfasEmployee'), []);
  assert.deepEqual(findBareMentions('fix: a\n\n```\n@Override\n```'), []);
  assert.deepEqual(findBareMentions('fix: mail someone@example.com'), []);
  assert.deepEqual(findBareMentions('fix: ping @org/team and @user-1'), ['@org/team', '@user-1']);
  assert.deepEqual(findBareMentions('Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>'), []);
});
