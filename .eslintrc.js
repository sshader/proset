module.exports = {
  // means don't look to parent dir, so use `root: true` in descendant directories to ignore this config
  // See https://eslint.org/docs/user-guide/configuring/configuration-files#cascading-and-hierarchy
  root: true,
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: ['./tsconfig.json'],
    tsconfigRootDir: __dirname,
  },
  plugins: ['@typescript-eslint', 'react-hooks', 'react'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:@next/next/recommended',
    'prettier',
  ],
  env: {
    amd: true,
    browser: true,
    jest: true,
    node: true,
  },
  rules: {
    'no-debugger': 'error',

    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/no-non-null-assertion': 'off',

    // allow (_arg: number) => {}
    '@typescript-eslint/no-unused-vars': [
      'error',
      {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
      },
    ],

    // Add React hooks rules so we don't misuse them.
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'warn',
    // From https://github.com/typescript-eslint/typescript-eslint/issues/1391#issuecomment-1124154589
    // Prefer `private` ts keyword to `#private` private methods
    'no-restricted-syntax': [
      'error',
      {
        selector:
          ':matches(PropertyDefinition, MethodDefinition) > PrivateIdentifier.key',
        message: 'Use `private` instead',
      },
    ],
    // Makes it harder to accidentally fire off a promise without waiting for it.
    '@typescript-eslint/no-floating-promises': 'error',
    'react/destructuring-assignment': [2, 'always'],
  },
  ignorePatterns: ['node_modules', 'convex/_generated', '*.js'],
}
