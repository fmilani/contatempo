module.exports = {
  parser: 'babel-eslint',
  parserOptions: {
    allowImportExportEverywhere: true,
  },
  plugins: ['meteor', 'prettier'],
  extends: [
    'airbnb',
    'plugin:meteor/recommended',
    'prettier',
    'prettier/react',
  ],
  settings: {
    'import/resolver': 'meteor',
  },
  rules: {
    'import/no-extraneous-dependencies': 'off',
    'import/extensions': ['off', 'never'],
    'prettier/prettier': [
      'error',
      {
        singleQuote: true,
        trailingComma: 'all',
      },
    ],
    'no-underscore-dangle': [
      'error',
      {
        allow: ['_id'],
      },
    ],
  },
};
