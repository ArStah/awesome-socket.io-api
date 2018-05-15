module.exports = {
  root: true,
  parserOptions: {
    parser: 'babel-eslint',
    sourceType: 'module',
  },
  env: {
    browser: true,
    node: true,
  },
  extends: [
    'airbnb-base',
    'plugin:flowtype/recommended',
  ],
  plugins: [
    'flowtype',
  ],
  rules: {
    'no-underscore-dangle': ['error', { 'allowAfterThis': true }],
    'import/no-named-as-default': 0,
    'import/no-named-as-default-member': 0,
  },
  globals: {
    publicPath: true,
  },
};
