const reactPlugin = require('eslint-plugin-react');
const reactNativePlugin = require('eslint-plugin-react-native');
const reactHooksPlugin = require('eslint-plugin-react-hooks');
const functionalPlugin = require('eslint-plugin-functional');

module.exports = [
  {
    files: ['**/*.{js,jsx}'],
    languageOptions: {
      ecmaVersion: 2021,
      sourceType: 'module',
      parserOptions: {
        ecmaFeatures: {
          jsx: true
        }
      },
      globals: {
        require: 'readonly',
        module: 'readonly',
        console: 'readonly',
        process: 'readonly',
        __dirname: 'readonly'
      }
    },
    plugins: {
      react: reactPlugin,
      'react-native': reactNativePlugin,
      'react-hooks': reactHooksPlugin,
      functional: functionalPlugin
    },
    settings: {
      react: {
        version: 'detect'
      }
    },
    rules: {
      // Functional programming rules
      'functional/no-let': 'error',
      'functional/immutable-data': 'off',
      'functional/no-loop-statements': 'error',
      'functional/prefer-readonly-type': 'off',
      'functional/no-this-expressions': 'error',
      'functional/prefer-tacit': 'warn',
      
      // React rules
      'react/prop-types': 'off',
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
      
      // React Native rules
      'react-native/no-unused-styles': 'error',
      'react-native/split-platform-components': 'error',
      'react-native/no-inline-styles': 'warn',
      'react-native/no-raw-text': 'warn',
      
      // General rules
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      'prefer-const': 'error',
      'no-var': 'error',
      'arrow-body-style': ['error', 'as-needed']
    }
  }
]; 