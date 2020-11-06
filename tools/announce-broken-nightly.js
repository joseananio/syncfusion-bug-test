const chatAnnounce = require('./chat-announce');

async function announceBrokenNightly() {

  const line1 = '⚠ The latest nightly build <a href="https://gitlab.cbb.de/viega/twms/twms-frontend-common/pipelines?scope=finished">did not succeed</a>';
  const line2 = 'Frontend team: Please verify if changes to the interface broke the e2e tests'
  const line3 = 'Backend team: Please verify that backend is still starting up under unix-CI'

  // constants
  const ROOM = '!clBsQBWeEDEnQSGTUI:matrix.cbb.de';  // frontend chat
  const message = `${line1}</br>&nbsp;&nbsp;${line2}</br>&nbsp;&nbsp;${line3}`;

  // do announce it
  chatAnnounce.announce(message, ROOM);
}

announceBrokenNightly();
