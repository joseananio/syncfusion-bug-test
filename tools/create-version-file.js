/**
 * Creates a version file to be included in a release for easy machine-readable version lookup.
 */
const fs = require('fs');

fs.writeFileSync('dist/twms-frontend-version.txt', process.env.npm_package_version);
