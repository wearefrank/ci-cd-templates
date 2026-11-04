const { isWip } = require('../lib/conventional-commits');

module.exports = {
  id: 'no-wip-commits',
  description: 'No `wip`, `fixup!`, `squash!`, `amend!` or `typo` commits, as they pollute the changelog.',
  run({ commits, fail }) {
    for (const commit of commits) {
      if (!commit.isMerge && isWip(commit.header)) {
        fail(`Commit ${commit.shortSha} \`${commit.header}\` looks like a work-in-progress commit. Clean it up with an interactive rebase (\`git rebase -i\`).`);
      }
    }
  },
};
