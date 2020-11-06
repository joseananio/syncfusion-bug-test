require('dotenv').config();
const fs = require('fs');
const spawnSync = require('child_process').spawnSync;
const decompress = require('decompress');

const ARCHITECTURE = process.argv[2] || 'win32';
const DONWLOAD_SOURCE = process.argv[3] || 'gitlab';
const BACKEND_VERSION = process.env.npm_package_backendVersion;

const GITLAB_PATH = 'https://gitlab.cbb.de';
const CACHE_DIR = 'third_party/.cache/twms-backend';
const TARGET_DIR = 'third_party/twms-backend';
const PROJECT_ID = 259;

async function downloadBackend() {
  if (!fs.existsSync('.env')) {
    const yellowTextFormat = '\x1b[33m%s\x1b[0m';
    console.error(
      yellowTextFormat,
      `Your .env file seems to be missing.
Please check the setup instructions at https://gitlab.cbb.de/viega/twms/twms-frontend-common#initial-setup.\n`,
    );
    process.exit(1);
  }

  let command = '';
  const target = `${CACHE_DIR}/twms-backend_${ARCHITECTURE}_${BACKEND_VERSION}.zip`;
  if (fs.existsSync(target)) {  // check if already cached
    command = null;
  } else if (DONWLOAD_SOURCE === 'gitlab') {
    // github artifact is called "linux-arm" rather than "linux_arm", so adjust the architecture name accordingly
    command = `curl "${GITLAB_PATH}/api/v4/projects/${PROJECT_ID}/jobs/artifacts/${BACKEND_VERSION}/download?job=${ARCHITECTURE.replace(
      'linux_arm',
      'linux-arm',
    )}-assemble-step&private_token=${process.env.GITLAB_PERSONAL_ACCESS_TOKEN}" -f# --output ${target} --create-dirs`;
  } else if (DONWLOAD_SOURCE === 'nexus') {
    command = `curl https://nexus.cbb.de/repository/twms-bin/backend/${BACKEND_VERSION}/backend_${ARCHITECTURE}_${BACKEND_VERSION}.zip -LfsS -u ${process.env.NEXUS_USERNAME}:${process.env.NEXUS_TOKEN} --output ${target} --create-dirs`;
  } else {
    console.error(`Unknown backend donwload source "${DONWLOAD_SOURCE}"`);
    return;
  }

  console.log(command
    ? `About to download backend version ${BACKEND_VERSION} for architecture ${ARCHITECTURE}: \n${command}\n\n`
    : `Copying backend ${BACKEND_VERSION} for architecture ${ARCHITECTURE} from cache`);

  try {
    // remove target dir
    spawnSync(`npx rimraf ${TARGET_DIR}`);
    // download, if not cached
    if (command) {
      const downloadResult = spawnSync(command, {
        stdio: 'inherit',
        shell: true,
      });
      if (downloadResult.status) {
        throw new Error('Backend download failed');
      }
    }
    // unzip
    await decompress(target, TARGET_DIR, {
      // strip top level directory when using GitLab build
      strip: DONWLOAD_SOURCE === 'gitlab' ? 1 : 0,
    });
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

downloadBackend();
