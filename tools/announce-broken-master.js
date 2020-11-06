const chatAnnounce = require('./chat-announce');

async function announceBrokenMaster() {
  const ROOM = '!clBsQBWeEDEnQSGTUI:matrix.cbb.de';  // frontend chat
  const message = `⚠ Oh no, the latest master or develop build <a href="https://gitlab.cbb.de/viega/twms/twms-frontend-common/pipelines?scope=finished">did not succeed</a>.`;
  chatAnnounce.announce(message, ROOM);
}

announceBrokenMaster();
