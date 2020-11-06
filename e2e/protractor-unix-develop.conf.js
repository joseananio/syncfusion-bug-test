// Protractor configuration file, see link for more information
// https://github.com/angular/protractor/blob/master/lib/config.ts

/* eslint-disable no-undef */
/* eslint-disable @typescript-eslint/no-var-requires */

const { SpecReporter } = require('jasmine-spec-reporter');
const node = require('ts-node');
const path = require('path');

exports.config = {
  /* Timeout 12 minutes for all tests. If timing out, ng e2e outputs garbage debug info, e.g. failing API request or tests. */
  allScriptsTimeout: 720000,
  specs: ['./src/**/*.e2e-spec.ts'],
  capabilities: {
    browserName: 'chrome',
    chromeOptions: {
      args: ['--disable-gpu', '--no-sandbox', '--disable-dev-shm-usage', 'lang=en-EN', '--log-level=3', '--start-maximized'],
    },
  },
  chromeDriver: './node_modules/webdriver-manager/selenium/chromedriver_83.0.4103.116',
  directConnect: true,
  baseUrl: 'http://localhost:4200/',
  framework: 'jasmine',
  jasmineNodeOpts: {
    showColors: true,
    defaultTimeoutInterval: 300000, // 5 minutes
    print: () => { /* do nothing */ },
    realtimeFailure: true,
  },
  params: {
    winston_loglevel: 'silly', // Todo remove this when CI e2e tests are succeeding
  },
  // params: { winston_loglevel: 'info' },
  // params: { winston_loglevel: 'silly' },
  onPrepare() {
    process.env.BROWSER_TIMEOUT_MULTIPLIER = 3;
    node.register({ project: path.join(__dirname, './tsconfig.e2e.json') });
    jasmine.getEnv().addReporter(new SpecReporter({ spec: { displayStacktrace: 'none' } }));
  },
};
