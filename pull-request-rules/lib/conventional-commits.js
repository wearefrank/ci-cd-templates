// Types match the releaseRules of the semantic-release configuration used by the projects.
const TYPES = ['feat', 'fix', 'perf', 'revert', 'docs', 'style', 'refactor', 'test', 'build', 'ci', 'chore'];

const HEADER = /^([a-z]+)(?:\(([^()\r\n]+)\))?(!)?: (\S.*)$/;
const BREAKING_NOTE = /^BREAKING(?:[ -]CHANGES?)?: \S/;

// Matched against the full header and against the description part of the header.
const WIP_PATTERNS = [/^\W*wip\b/i, /^(fixup|squash|amend)!/, /^(fix(ed)? )?typos?$/i];

// A mention is an `@` that is not preceded by a word character (so e-mail addresses are ignored).
const MENTION = /(?<![\w`@/.+-])@[A-Za-z0-9](?:[A-Za-z0-9-]*[A-Za-z0-9])?(?:\/[\w.-]+)?/g;

/**
 * Parses a commit message or PR title.
 * `breakingNotes` are the `BREAKING: ...` lines, `misplacedBreakingNotes` are those not in the footer (last paragraph).
 */
function parse(message) {
  const text = (message || '').replace(/\r\n/g, '\n').trim();
  const header = text.split('\n')[0];
  const match = HEADER.exec(header);

  const paragraphs = text.split(/\n[ \t]*\n/);
  const breakingNotes = [];
  const misplacedBreakingNotes = [];
  paragraphs.forEach((paragraph, index) => {
    for (const line of paragraph.split('\n')) {
      if (!BREAKING_NOTE.test(line)) continue;
      breakingNotes.push(line);
      if (index === 0 || index !== paragraphs.length - 1) misplacedBreakingNotes.push(line);
    }
  });

  return {
    header,
    type: match ? match[1] : null,
    scope: match ? match[2] || null : null,
    description: match ? match[4] : header,
    hasBreakingMark: Boolean(match && match[3]),
    wellFormed: match !== null,
    knownType: match !== null && TYPES.includes(match[1]),
    breakingNotes,
    misplacedBreakingNotes,
    breaking: Boolean((match && match[3]) || breakingNotes.length),
  };
}

function isWip(header) {
  const { description } = parse(header);
  return WIP_PATTERNS.some((pattern) => pattern.test(header) || pattern.test(description));
}

function stripCode(text) {
  return (text || '').replace(/```[\s\S]*?```/g, '').replace(/`[^`\n]*`/g, '');
}

function findBareMentions(text) {
  return [...new Set(stripCode(text).match(MENTION) || [])];
}

module.exports = { TYPES, parse, isWip, findBareMentions };
