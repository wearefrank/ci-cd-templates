const fs = require('node:fs');

const escapeData = (value) => value.replace(/%/g, '%25').replace(/\r/g, '%0D').replace(/\n/g, '%0A');
const escapeProperty = (value) => escapeData(value).replace(/:/g, '%3A').replace(/,/g, '%2C');

/**
 * Makes the results visible without needing permission to comment on the PR:
 * as annotations on the workflow run, and as the job summary.
 */
function publish(results, skippedRuleIds, env = process.env) {
  if (env.GITHUB_ACTIONS !== 'true') return;

  for (const { level, ruleId, text } of results) {
    const command = level === 'fail' ? 'error' : 'warning';
    console.log(`::${command} title=${escapeProperty(ruleId)}::${escapeData(text)}`);
  }

  if (!env.GITHUB_STEP_SUMMARY) return;
  const lines = ['## Pull request rules', ''];
  if (!results.length) lines.push('✅ All rules passed.');
  for (const { level, ruleId, text } of results) {
    lines.push(`- ${level === 'fail' ? '❌' : '⚠️'} **${ruleId}**: ${text}`);
  }
  if (skippedRuleIds.length) lines.push('', `Skipped rules: ${skippedRuleIds.map((id) => `\`${id}\``).join(', ')}`);
  fs.appendFileSync(env.GITHUB_STEP_SUMMARY, `${lines.join('\n')}\n`);
}

module.exports = { publish };
