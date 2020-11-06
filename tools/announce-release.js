const chatAnnounce = require('./chat-announce');

async function announceRelease() {
  const ROOM = '!TherlBcDflqyYevcog:matrix.cbb.de';  // TWMS DevTalk
  const FRONTEND_VERSION = process.env.npm_package_version;
  const BACKEND_VERSION = process.env.npm_package_backendVersion;
  const joymojis = ['💃', '🎉', '🥳', '🏁', '😻', '🙀', '😎', '✨', '🌠'];
  const emoji = joymojis[Math.floor(Math.random() * joymojis.length)];
  const releaseType = isActualRelease(FRONTEND_VERSION) ? 'release' : 'release candidate';
  const message = `<h2>Frontend ${releaseType} ${FRONTEND_VERSION} is now available. ${emoji}</h2>
<i>Supported backend: ${BACKEND_VERSION}</i><br>
<a href="https://gitlab.cbb.de/viega/twms/twms-frontend-common/-/releases/${FRONTEND_VERSION}">📑 Changelog</a>
<a href="https://nexus.cbb.de/#browse/browse:twms-bin:frontend%2F${FRONTEND_VERSION}">⬢ Build (Nexus)</a>
<a href="https://gitlab.cbb.de/viega/twms/twms-frontend-common/pipelines?scope=tags">🦊 Build (GitLab)</a>`;
  chatAnnounce.announce(message, ROOM);
}

function isActualRelease(version) {
  return !!version.match(/^\d+\.\d+\.\d+$/);
}

announceRelease();
