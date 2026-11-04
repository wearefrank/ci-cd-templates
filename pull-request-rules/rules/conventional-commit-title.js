const { TYPES } = require('../lib/conventional-commits');

module.exports = {
  id: 'conventional-commit-title',
  description: 'The PR title follows Conventional Commits, as it becomes the commit message when squashing.',
  run({ pr, title, fail }) {
    if (!title.wellFormed) {
      fail(`PR title \`${pr.title}\` is not a Conventional Commit. Use \`<type>(<optional scope>): <description>\`, for example \`fix: handle empty response\`.`);
    } else if (!title.knownType) {
      fail(`PR title uses unknown type \`${title.type}\`. Use one of: ${TYPES.join(', ')}.`);
    }
  },
};
