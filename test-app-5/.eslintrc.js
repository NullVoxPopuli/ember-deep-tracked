'use strict';

const { configs } = require('@nullvoxpopuli/eslint-configs');

const config = configs.ember();

module.exports = {
  ...config,
  overrides: [
    ...config.overrides,
    {
      files: ['**/*.ts'],
      rules: {
        '@typescript-eslint/no-explicit-any': 'off',

        /**
         * `@ember/component` is missing types
         */
        '@typescript-eslint/ban-ts-comment': 'off',
      },
    },
  ],
};
