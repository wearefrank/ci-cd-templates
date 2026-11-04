# Pull Request Rules
Checks a pull request against a set of rules, powered by [Danger JS](https://danger.systems/js/). A base set of rules is always checked, and the calling repository can skip base rules and add rules of its own.

The action reports the results as annotations and in the job summary, and fails the job when a rule fails. Warnings do not fail the job. Optionally the results are also posted as a comment on the pull request.

## Usage
Add a workflow to the repository that should be checked. The action only supports the `pull_request` event. Don't use `pull_request_target`, because the rules of the repository are executed.

``` yaml
name: Pull Request Rules

on:
  pull_request:
    types: [opened, edited, synchronize, reopened]

permissions:
  contents: read
  pull-requests: read

jobs:
  pull-request-rules:
    runs-on: ubuntu-latest
    steps:
      - uses: wearefrank/ci-cd-templates/pull-request-rules@1
```
The `edited` type makes the rules run again after the title or description of the pull request is changed. Make the job a required status check in the branch protection or ruleset of the repository to enforce the rules.

## Base rules
| Rule id | Level | Description |
|---------|-------|-------------|
| `conventional-commit-title` | fail | The PR title follows [Conventional Commits](https://www.conventionalcommits.org/), as it becomes the commit message when squashing. |
| `conventional-commit-messages` | fail | Every commit message follows Conventional Commits, as it ends up in the changelog when rebasing. Merge commits are ignored. |
| `no-wip-commits` | fail | No `wip`, `fixup!`, `squash!`, `amend!` or `typo` commits. |
| `breaking-change-footer` | fail / warn | A `BREAKING: <description>` note must be in the footer: the last paragraph of the commit message. Fails when it is somewhere else, warns when a commit is marked with `!` without a `BREAKING` footer. |
| `no-bare-mentions` | fail | Words starting with `@` in the PR title and commit messages must be wrapped in backticks, otherwise the changelog mentions a GitHub user. Skipped for bots like Dependabot. |

The allowed types are `feat`, `fix`, `perf`, `revert`, `docs`, `style`, `refactor`, `test`, `build`, `ci` and `chore`, matching the release rules used by the projects.

## Adding and skipping rules
Create a file in the repository that uses the action, by default `.github/pull-request-rules.js`. It is optional.

``` js
module.exports = {
  // Ids of base rules that don't apply to this repository.
  skip: ['no-wip-commits'],

  // Rules that are checked in addition to the base rules. Ids need to be unique.
  rules: [
    {
      id: 'docs-updated',
      description: 'Source changes come with a documentation change.',
      run({ files, warn }) {
        const changesSource = files.all.some((file) => file.startsWith('src/'));
        const changesDocs = files.all.some((file) => file.endsWith('.md'));
        if (changesSource && !changesDocs) warn('Source is changed, is the documentation up to date?');
      },
    },
  ],
};
```
Rules can be `async`. A rule reports with `fail(text)`, which fails the check, or `warn(text)`. The result is shown with the id of the rule. A rule that throws fails the check.

The rules file is JavaScript that runs with the pull request's content, so it can be changed in the pull request itself. Protect it with a CODEOWNERS entry if the rules need to be enforced.

### Rule context
| Property | Description |
|----------|-------------|
| `pr` | The pull request as returned by the GitHub API, for example `pr.title`, `pr.body`, `pr.base.ref`, `pr.draft`, `pr.labels` and `pr.user`. |
| `title` | The PR title parsed as a Conventional Commit, see `parse` below. |
| `commits` | The commits of the pull request. Each has `sha`, `shortSha`, `message`, `header`, `isMerge` and `parsed`, the message parsed as a Conventional Commit. |
| `files` | Changed files as lists of paths: `created`, `modified`, `deleted` and `all`. |
| `isBot` | `true` when the pull request is opened by a bot. |
| `conventional` | Helpers: `parse(message)`, `isWip(header)`, `findBareMentions(text)` and `TYPES`. |
| `danger` | The complete [Danger JS DSL](https://danger.systems/js/reference.html), for example `danger.git.diffForFile(path)`. |
| `fail`, `warn` | Report a result. |

`parse` returns `header`, `type`, `scope`, `description`, `wellFormed`, `knownType`, `hasBreakingMark`, `breakingNotes`, `misplacedBreakingNotes` and `breaking`.

## Inputs
| Name | Description | Default |
|------|-------------|---------|
| rules-file | Path, relative to the root of the repository, to the optional file with extra rules and rules to skip. | `.github/pull-request-rules.js` |
| github-token | Token used to read the pull request. | `${{ github.token }}` |
| post-comment | Also post the results as comment on the pull request. Needs the `pull-requests: write` permission, which is not available for pull requests from forks. | `false` |

## Notes
- The action checks out the repository and installs Danger from the npm registry. When using Harden-Runner with a blocking egress policy, allow `registry.npmjs.org:443`.
- The rules run on the content of the pull request, so a change of the title or description is only picked up when the workflow also triggers on `edited`.

## Development
The rules are tested with the Node.js test runner:
``` shell
cd pull-request-rules
npm ci
npm test
```
To try the rules on an existing pull request without posting anything:
``` shell
DANGER_GITHUB_API_TOKEN=$(gh auth token) npx danger pr https://github.com/<owner>/<repo>/pull/<number> --dangerfile dangerfile.js
```
