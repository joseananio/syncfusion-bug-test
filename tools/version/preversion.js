const { execSync } = require('child_process');

const DEVELOP_BRANCH = 'develop';
const RELEASE_BRANCH_PREFIX = 'release/';

function main() {
  // check current branch name
  const branch = execSync('git rev-parse --abbrev-ref HEAD').toString().trim();
  if (branch !== DEVELOP_BRANCH && !branch.startsWith(RELEASE_BRANCH_PREFIX)) {
    console.error(`Running 'npm version' is only supported on the '${DEVELOP_BRANCH}' and '${RELEASE_BRANCH_PREFIX}*' branches.`);
    process.exit(1);
  } else if (branch.startsWith(RELEASE_BRANCH_PREFIX)) {
    execSync('git pull');  // get latest changes from remote
  }
}

main();
