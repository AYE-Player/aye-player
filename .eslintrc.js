module.exports = {
  extends: 'erb',
  rules: {
    // A temporary hack related to IDE not resolving correct package.json
    'import/no-extraneous-dependencies': 'off',
    'import/no-unresolved': 'error',
    'no-use-before-define': 'off',
    '@typescript-eslint/no-use-before-define': 'off',
    'react/no-unstable-nested-components': 'off',
    // Since React 17 and typescript 4.1 you can safely disable the rule
    'react/react-in-jsx-scope': 'off',
    'func-names': [
      'warn',
      'always',
      {
        generators: 'never',
      },
    ],
    'react/jsx-filename-extension': [
      2,
      { extensions: ['.js', '.jsx', '.ts', '.tsx'] },
    ],
    'no-unused-vars': 'warn',
    'no-restricted-syntax': 'off',
    'import/no-cycle': 'off',
    '@typescript-eslint/no-non-null-assertion': 'off',
    'react/function-component-definition': [
      2,
      { namedComponents: 'arrow-function', unnamedComponents: 'arrow-function' },
    ],
    'import/extensions': [
      'error',
      'ignorePackages',
      {
        js: 'never',
        jsx: 'never',
        ts: 'never',
        tsx: 'never',
      },
    ],
  },
  overrides: [
    {
      files: ['*.ts'],
      rules: {
        'no-undef': 'off',
      },
    },
  ],
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
    project: './tsconfig.json',
    tsconfigRootDir: __dirname,
    createDefaultProgram: true,
  },
  settings: {
    'import/resolver': {
      // See https://github.com/benmosher/eslint-plugin-import/issues/1396#issuecomment-575727774 for line below
      node: {},
      webpack: {
        config: require.resolve('./.erb/configs/webpack.config.eslint.ts'),
      },
      typescript: {},
    },
    'import/parsers': {
      '@typescript-eslint/parser': ['.ts', '.tsx'],
    },
  },
};
