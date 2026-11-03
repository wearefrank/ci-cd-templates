module.exports = {
  id: 'breaking-change-footer',
  description: 'Breaking changes are described with a `BREAKING: <description>` footer, which ends up in the changelog.',
  run({ commits, fail, warn }) {
    for (const commit of commits) {
      if (commit.isMerge) continue;
      const { misplacedBreakingNotes, hasBreakingMark, breakingNotes } = commit.parsed;

      if (misplacedBreakingNotes.length) {
        fail(`Commit ${commit.shortSha}: \`BREAKING: <description>\` must be in the footer, so in the last paragraph of the commit message, separated by a blank line from the rest.`);
      } else if (hasBreakingMark && !breakingNotes.length) {
        warn(`Commit ${commit.shortSha} is marked breaking with \`!\` but has no \`BREAKING: <description>\` footer to explain the change in the changelog.`);
      }
    }
  },
};
