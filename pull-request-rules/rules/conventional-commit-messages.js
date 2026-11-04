const { TYPES, isWip } = require('../lib/conventional-commits');

module.exports = {
  id: 'conventional-commit-messages',
  description: 'Every commit message follows Conventional Commits, as it ends up in the changelog when rebasing.',
  run({ commits, fail }) {
    for (const commit of commits) {
      // Merge commits are not part of the changelog, and WIP commits are reported by `no-wip-commits`.
      if (commit.isMerge || isWip(commit.header)) continue;

      if (!commit.parsed.wellFormed) {
        fail(`Commit ${commit.shortSha} \`${commit.header}\` is not a Conventional Commit. Use \`<type>(<optional scope>): <description>\`.`);
      } else if (!commit.parsed.knownType) {
        fail(`Commit ${commit.shortSha} uses unknown type \`${commit.parsed.type}\`. Use one of: ${TYPES.join(', ')}.`);
      }
    }
  },
};
