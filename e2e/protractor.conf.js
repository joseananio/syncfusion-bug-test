// Protractor configuration file, see link for more information
// https://github.com/angular/protractor/blob/master/lib/config.ts

const { SpecReporter } = require('jasmine-spec-reporter');
const node = require('ts-node');
const path = require('path');

exports.config = {
  // Timeout 10 minutes for all tests
  allScriptsTimeout: 600000,
  specs: ['./src/**/*.e2e-spec.ts'],
  capabilities: {
    /*     'browserName': 'firefox', */
    browserName: 'chrome',
    chromeOptions: {
      args: ['--disable-gpu', '--inspect-brk', 'lang=en-EN', '--start-maximized'],
    },
  },
  directConnect: true,
  baseUrl: 'http://localhost:4200/',
  framework: 'jasmine',
  jasmineNodeOpts: {
    showColors: true,
    defaultTimeoutInterval: 60000,
    print: function () { },
  },
  params: {
    // winston_loglevel: 'debug',
    winston_loglevel: 'silly', // This will give you a silly amount of debug output
  },
  onPrepare() {
    process.env.BROWSER_TIMEOUT_MULTIPLIER = 1;
    node.register({ project: path.join(__dirname, './tsconfig.e2e.json') });
    jasmine.getEnv().addReporter(new SpecReporter({ spec: { displayStacktrace: 'none' } }));

    // kill test execution in case of unhandled rejections
    process.on('unhandledRejection', error => {
      console.error('unhandledRejection caught: %o', error);
    });

  },
};
