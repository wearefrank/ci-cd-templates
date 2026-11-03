/* global danger, fail, warn, schedule */
const { run } = require('./lib/runner');
const baseRules = require('./rules');

schedule(() => run({ danger, fail, warn, baseRules, rulesFile: process.env.PR_RULES_FILE }));
