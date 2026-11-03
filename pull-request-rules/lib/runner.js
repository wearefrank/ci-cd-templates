const fs = require('node:fs');
const path = require('node:path');
const conventional = require('./conventional-commits');
const { publish } = require('./report');

/**
 * The optional rules file of a project exports `{ skip: ['rule-id'], rules: [{ id, description, run(ctx) }] }`.
 */
function loadProjectRules(rulesFile, workspace) {
  if (!rulesFile) return { skip: [], rules: [] };

  const resolved = path.resolve(workspace, rulesFile);
  if (path.relative(workspace, resolved).startsWith('..')) {
    throw new Error(`Rules file ${rulesFile} must be inside the repository.`);
  }
  if (!fs.existsSync(resolved)) return { skip: [], rules: [] };

  const { skip = [], rules = [] } = require(resolved);
  return { skip, rules };
}

function validate(rules) {
  const ids = new Set();
  for (const rule of rules) {
    if (!rule || typeof rule.id !== 'string' || typeof rule.run !== 'function') {
      throw new Error('Every rule needs a string `id` and a `run(ctx)` function.');
    }
    if (ids.has(rule.id)) throw new Error(`Duplicate rule id \`${rule.id}\`. Rule ids must be unique, also compared to the base rules.`);
    ids.add(rule.id);
  }
}

function createContext(danger) {
  const pr = danger.github.pr;
  const commits = danger.github.commits.map((entry) => ({
    sha: entry.sha,
    shortSha: entry.sha.slice(0, 7),
    message: entry.commit.message,
    header: entry.commit.message.split('\n')[0],
    isMerge: entry.parents.length > 1,
    parsed: conventional.parse(entry.commit.message),
  }));
  const files = {
    created: danger.git.created_files,
    modified: danger.git.modified_files,
    deleted: danger.git.deleted_files,
  };

  return {
    danger,
    pr,
    title: conventional.parse(pr.title),
    commits,
    files: { ...files, all: [...files.created, ...files.modified, ...files.deleted] },
    isBot: pr.user.type === 'Bot' || pr.user.login.endsWith('[bot]'),
    conventional,
  };
}

async function run({ danger, fail, warn, baseRules, rulesFile, workspace = process.env.GITHUB_WORKSPACE || process.cwd() }) {
  const results = [];
  const report = (level, ruleId, text) => {
    results.push({ level, ruleId, text });
    (level === 'fail' ? fail : warn)(`**${ruleId}**: ${text}`);
  };

  let project;
  try {
    project = loadProjectRules(rulesFile, workspace);
    validate([...baseRules, ...project.rules]);
  } catch (error) {
    report('fail', 'pull-request-rules', `Invalid rules file: ${error.message}`);
    publish(results, []);
    return;
  }

  const skipped = new Set(project.skip);
  const known = new Set([...baseRules, ...project.rules].map((rule) => rule.id));
  for (const id of skipped) {
    if (!known.has(id)) report('warn', 'pull-request-rules', `Skipped rule \`${id}\` does not exist.`);
  }

  const context = createContext(danger);
  for (const rule of [...baseRules, ...project.rules]) {
    if (skipped.has(rule.id)) continue;
    try {
      await rule.run({
        ...context,
        fail: (text) => report('fail', rule.id, text),
        warn: (text) => report('warn', rule.id, text),
      });
    } catch (error) {
      report('fail', rule.id, `Rule crashed: ${error.message}`);
    }
  }

  publish(results, [...skipped]);
}

module.exports = { run, loadProjectRules, validate, createContext };
