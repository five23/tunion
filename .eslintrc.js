module.exports = {
  env: {
    browser: true,
    node: true,
    worker: true,
    es2021: true
  },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react/recommended',
    'airbnb'
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaFeatures: {
      jsx: true
    },
    ecmaVersion: 12,
    sourceType: 'module'
  },
  plugins: ['react', '@typescript-eslint'],
  rules: {
    'comma-dangle': [
      'error',
      {
        arrays: 'never',
        objects: 'never',
        imports: 'never',
        exports: 'never',
        functions: 'never'
      }
    ],
    'no-use-before-define': [
      'error', 
      { 
        imports: 'never'
      }
    ],
    'react/jsx-filename-extension': [
      1, 
      { 
        extensions: [
          '.tsx', 
          '.ts'
        ] 
      }
    ]
  }
};
