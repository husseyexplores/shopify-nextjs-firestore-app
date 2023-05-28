module.exports = {
  plugins: ['prettier'],
  extends: ['next', 'next/core-web-vitals', 'prettier'],
  rules: {
    'prettier/prettier': 'error',
    camelcase: 'off',
    'import/prefer-default-export': 'off',
    'react/jsx-filename-extension': 'off',
    'react/jsx-props-no-spreading': 'off',
    'react/no-unused-prop-types': 'off',
    'react/require-default-props': 'off',
    'import/extensions': [
      'error',
      'ignorePackages',
      {
        ts: 'never',
        tsx: 'never',
        js: 'never',
        jsx: 'never',
      },
    ],
    'jsx-a11y/anchor-is-valid': [
      'error',
      {
        components: ['Link'],
        specialLink: ['hrefLeft', 'hrefRight'],
        aspects: ['invalidHref', 'preferButton'],
      },
    ],
  },
  overrides: [
    {
      files: '**/*.+(ts|tsx)',
      parser: '@typescript-eslint/parser',
      plugins: ['@typescript-eslint/eslint-plugin'],
      extends: ['plugin:@typescript-eslint/recommended', 'prettier'],
      rules: {
        '@typescript-eslint/explicit-function-return-type': 'off',
        '@typescript-eslint/explicit-module-boundary-types': 'off',
        'no-use-before-define': [0],
        '@typescript-eslint/no-use-before-define': [0],
        '@typescript-eslint/no-explicit-any': 'off',
        '@typescript-eslint/no-var-requires': 'off',
        'react/no-unescaped-entities': ['off'],
        'react/no-unescaped-entities': 0,
        '@typescript-eslint/ban-ts-comment': 'off',
        'import/extensions': ['off'],
        'prefer-const': 'off',
        '@typescript-eslint/no-unused-vars': 'off',
        'jsx-a11y/anchor-is-valid': 'off',
      },
    },
  ],
}
