require('dotenv').config();
const fs = require('fs');
const { execSync } = require('child_process');

const MASTER_BRANCH = 'master';
const DEVELOP_BRANCH = 'develop';
const DEVELOP_PRERELEASE_PREFIX = 'prerelease/';
const RELEASE_BRANCH_PREFIX = 'release/';
const GITLAB_PATH = 'https://gitlab.cbb.de';
const PROJECT_PATH = 'viega/twms/twms-frontend-common';
const PROJECT_ID = 277;

function main() {
  const branchName = execSync('git rev-parse --abbrev-ref HEAD').toString().trim();
  if (branchName.startsWith(RELEASE_BRANCH_PREFIX) || branchName.startsWith(DEVELOP_PRERELEASE_PREFIX)) {
    // check if first commit on branch
    const commitCount = execSync(`git rev-list --count ${DEVELOP_BRANCH}..HEAD`).toString().trim();
    const branchVersion = `${process.env.npm_package_version}`;
    const preReleaseVersion = `${getMainVersion(branchVersion)}-${getPrerelease(branchVersion)}`;

    // update version information in files
    console.log('Updating files...');
    const version = (isActualRelease(branchVersion) && commitCount !== '1') ? branchVersion : preReleaseVersion;
    try {
      updateVersion(version);
      execSync('git add -u');
      execSync(`git commit --amend -m ${version}`);
    } catch (error) {
      console.error('The version information in files could not be updated correctly.');
      console.error(error);
      process.exit(1);
    }

    if (commitCount === '1') {  // is first commit on release or prerelease branch
      try {
        // we need to save this tag for the very last commit on this branch
        execSync(`git tag -d v${branchVersion}`);

        console.log('Creating merge request(s)...');
        // create merge request for release and prerelease branches
        createMergeRequest(branchName, DEVELOP_BRANCH, `WIP: Merge release ${branchVersion} into ${DEVELOP_BRANCH}`);
        // create another merge request for actual release branches
        if (isActualRelease(branchVersion)) {
          createMergeRequest(branchName, MASTER_BRANCH, `WIP: Merge release ${branchVersion} into ${MASTER_BRANCH}`);
        }
      } catch (error) {
        console.error('The release branch could not be initialized correctly.');
        console.error(error);
        process.exit(1);
      }
    }

    // The amending at the beginning did not move the tag, so let's steal it now.
    execSync(`git tag -f -a v${version} -m ${version}`);

    // always push to remote
    try {
      console.log('Pushing to remote...');
      execSync(`git push --set-upstream origin ${branchName}`);
      execSync('git push --follow-tags');
    } catch (error) {
      console.error('The release branch could not be pushed to remote.');
    }

    const finalizesBranch = commitCount !== '1' && isActualRelease(branchVersion);
    // finalize release branch
    if (finalizesBranch) {
      console.log('Opening merge requests...');
      openMergeRequests();
    }

    // always edit release notes on release branch
    console.log('Opening release notes...');
    const tag = `v${version}`;
    editReleaseNotes(tag, finalizesBranch ? 'branch' : 'empty');
  }
}

function openMergeRequests() {
  execSync(`start "${GITLAB_PATH}/${PROJECT_PATH}/-/merge_requests?state=opened&search=wip%3A+release"`);
}

function editReleaseNotes(tag, initialize) {
  try {
    if (initialize === 'empty') {
      const message = 'This is an auto-generated, blank changelog. Please check the [merges since the last release](https://gitlab.cbb.de/viega/twms/twms-frontend-common/merge_requests?state=merged) to find out what happened since the last version.\n## Added\n## Changed\n## Deprecated\n## Removed\n## Fixed\n## Security';
      insertChangelog(tag, message);
    } else if (initialize === 'branch') {
      const message = 'This is an auto-generated, blank changelog. Please merge the [release notes of the previous RCs](https://gitlab.cbb.de/viega/twms/twms-frontend-common/-/releases) to document what happened since the last version.';
      insertChangelog(tag, message);
    }
  } catch (error) {
    console.error('Could not prepare default changelog');
    console.error(error);
  }
  execSync(`start "${GITLAB_PATH}/${PROJECT_PATH}/-/tags/${tag}/release/edit"`);
}

function updateVersion(newVersion) {
  const files = [
    { file: './package.json', key: 'version' },
    { file: './package-lock.json', key: 'version' },
    { file: './src/assets/i18n/de.json', key: '_META.VERSION' },
    { file: './src/assets/i18n/en.json', key: '_META.VERSION' },
  ];
  files.forEach((file) => {
    const packageConfig = JSON.parse(fs.readFileSync(file.file));
    // not very elegant, but good enough at this scale
    if (file.key === 'version') {
      packageConfig.version = newVersion;
    } else {
      packageConfig._META.VERSION = newVersion;
    }
    fs.writeFileSync(file.file, `${JSON.stringify(packageConfig, null, 2)}\n`);
  });
}

function getPrerelease(version) {
  if (version.match(/^\d+\.\d+\.\d+$/)) {  // regular release
    return 'rc.0';
  }

  const idLessMatch = version.match(/^\d+\.\d+\.\d+-(\d+)$/);  // preid-less prerelease
  if (idLessMatch) {
    return `dev.${idLessMatch[1]}`;
  }

  const idMatch = version.match(/^\d+\.\d+\.\d+-(.+)$/);  // prerelease with preid
  if (idMatch) {
    return idMatch[1];
  }

  return '';
}

function getMainVersion(version) {
  const separatorIndex = version.indexOf('-');
  return separatorIndex >= 0 ? version.substr(0, separatorIndex) : version;
}

function createMergeRequest(from, to, title, description) {
  const requestArguments = {
    title,
    description,
    source_branch: from,
    target_branch: to,
    remove_source_branch: false,  // we may want to merge source into two branches
  };
  const command = `curl -X POST -f -d "${serializeRequestBody(requestArguments)}" -H "Content-Type: application/json" "${GITLAB_PATH}/api/v4/projects/${PROJECT_ID}/merge_requests?private_token=${process.env.GITLAB_PERSONAL_ACCESS_TOKEN}"`;
  execSync(command);
}

function insertChangelog(tag, message) {
  const requestArguments = {
    description: message,
    assets: {
      links: [
        {
          url: `https://nexus.cbb.de/#browse/browse:twms-bin:frontend%2F${tag}`,
          name: 'Build on Nexus',
        },
      ],
    },
  };
  const command = `curl -X POST -f -d "${serializeRequestBody(requestArguments)}" -H "Content-Type: application/json" "${GITLAB_PATH}/api/v4/projects/${PROJECT_ID}/repository/tags/${tag}/release?private_token=${process.env.GITLAB_PERSONAL_ACCESS_TOKEN}"`;
  execSync(command);
}

function serializeRequestBody(json) {
  return JSON.stringify(json).replace(/"/g, '\\"');
}

/**
 * ...and not just a prerelease.
 */
function isActualRelease(version) {
  return version.search('-') === -1;
}

main();
