const { findBareMentions } = require('../lib/conventional-commits');

module.exports = {
  id: 'no-bare-mentions',
  description: 'Words starting with `@` in the PR title and commit messages are wrapped in backticks, otherwise the changelog mentions a GitHub user.',
  run({ pr, commits, isBot, fail }) {
    // Bots like Dependabot reference scoped packages such as `@types/node`.
    if (isBot) return;

    const check = (label, text) => {
      const mentions = findBareMentions(text);
      if (mentions.length) {
        fail(`${label} mentions ${mentions.map((m) => `\`${m}\``).join(', ')}. Wrap it in backticks, for example \`${mentions[0]}\`, to prevent mentioning a GitHub user in the changelog.`);
      }
    };

    check('PR title', pr.title);
    for (const commit of commits) {
      if (!commit.isMerge) check(`Commit ${commit.shortSha}`, commit.message);
    }
  },
};
