'use strict';

const getChannelURL = require('ember-source-channel-url');

module.exports = async function () {
  return {
    usePnpm: true,
    scenarios: [
      {
        name: 'ember-3.25',
        npm: {
          devDependencies: {
            'ember-source': '~3.25.0',
          },
        },
      },
      {
        name: 'ember-lts-3.28',
        npm: {
          devDependencies: {
            'ember-source': '~3.28.0',
          },
        },
      },
      {
        name: 'ember-lts-4.4',
        npm: {
          devDependencies: {
            'ember-source': '~4.4.0',
          },
        },
      },
      {
        name: 'ember-lts-4.8',
        npm: {
          devDependencies: {
            'ember-source': '~4.8.0',
          },
        },
      },
      {
        name: 'ember-lts-4.12',
        npm: {
          devDependencies: {
            'ember-source': '~4.12.0',
          },
        },
      },
      {
        name: 'ember-lts-5.4',
        npm: {
          devDependencies: {
            'ember-export-application-global': null,
            '@ember/string': '^4.0.0',
            '@ember/test-helpers': '^4.0.4',
            'ember-resolver': '^12.0.1',
            'ember-cli-app-version': '^7.0.0',
            'ember-qunit': '^8.1.0',
            'ember-source': '~5.4.0',
            'ember-cli': '^5.11.0',
          },
        },
      },
      {
        name: 'ember-lts-5.8',
        npm: {
          devDependencies: {
            'ember-export-application-global': null,
            '@ember/string': '^4.0.0',
            '@ember/test-helpers': '^4.0.4',
            'ember-resolver': '^12.0.1',
            'ember-cli-app-version': '^7.0.0',
            'ember-qunit': '^8.1.0',
            'ember-source': '~5.8.0',
            'ember-cli': '^5.11.0',
          },
        },
      },
      {
        name: 'ember-release',
        npm: {
          devDependencies: {
            'ember-export-application-global': null,
            '@ember/string': '^4.0.0',
            '@ember/test-helpers': '^4.0.4',
            'ember-resolver': '^12.0.1',
            'ember-cli-app-version': '^7.0.0',
            'ember-qunit': '^8.1.0',
            'ember-cli': '^5.11.0',
            'ember-source': await getChannelURL('release'),
          },
        },
      },
      {
        name: 'ember-beta',
        npm: {
          devDependencies: {
            'ember-export-application-global': null,
            '@ember/string': '^4.0.0',
            '@ember/test-helpers': '^4.0.4',
            'ember-resolver': '^12.0.1',
            'ember-cli-app-version': '^7.0.0',
            'ember-qunit': '^8.1.0',
            'ember-cli': '^5.11.0',
            'ember-source': await getChannelURL('beta'),
          },
        },
      },
      {
        name: 'ember-canary',
        npm: {
          devDependencies: {
            'ember-export-application-global': null,
            '@ember/string': '^4.0.0',
            '@ember/test-helpers': '^4.0.4',
            'ember-resolver': '^12.0.1',
            'ember-cli-app-version': '^7.0.0',
            'ember-qunit': '^8.1.0',
            'ember-cli': '^5.11.0',
            'ember-source': await getChannelURL('canary'),
          },
        },
      },
    ],
  };
};
