const { execSync } = require('child_process');

const DEVELOP_BRANCH = 'develop';
const DEVELOP_PRERELEASE_PREFIX = 'prerelease/';
const RELEASE_BRANCH_PREFIX = 'release/';

function main() {
  const currentBranch = execSync('git rev-parse --abbrev-ref HEAD').toString().trim();
  const version = process.env.npm_package_version;
  if (currentBranch === DEVELOP_BRANCH) {  // create new branch
    const branchName = isPrerelease(version)
      ? `${DEVELOP_PRERELEASE_PREFIX}${version}`
      : `${RELEASE_BRANCH_PREFIX}${version}`;
    execSync(`git checkout -b ${branchName}`);
  } else if (currentBranch.startsWith(RELEASE_BRANCH_PREFIX)) {  // work on development branch
    const branchVersion = currentBranch.match(/\/(.*)$/)[1];
    const versionTrunk = version.match(/(\d+\.\d+\.\d+)/)[1];
    if (branchVersion !== versionTrunk) {
      console.error(`It is not possible to assign version ${version} on branch ${currentBranch}`);
      process.exit(1);
    }
  }
}

function isPrerelease(version) {
  return version.search('-') >= 0;
}

main();
