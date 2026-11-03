module.exports = {
  skip: ['no-such-rule'],
  rules: [{ id: 'always-warn', run: ({ files, warn }) => warn(`project rule ran, ${files.all.length} files changed`) }],
};
