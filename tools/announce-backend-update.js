const chatAnnounce = require('./chat-announce');
const { execSync } = require('child_process');

async function announceBackendUpdate() {
  const ROOM = '!clBsQBWeEDEnQSGTUI:matrix.cbb.de';  // frontend chat
  const BACKEND_VERSION = process.env.npm_package_backendVersion;
  const BRANCH_NAME = execSync('git rev-parse --abbrev-ref HEAD').toString().trim();
  const message = `An update to backend ${BACKEND_VERSION} has just been merged into ${BRANCH_NAME}.🎁`;
  chatAnnounce.announce(message, ROOM);
}

announceBackendUpdate();
