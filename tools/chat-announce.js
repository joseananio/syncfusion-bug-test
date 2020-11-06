require('dotenv').config();  // used for environment variables in local development
const sdk = require('matrix-js-sdk');

module.exports = {
  /**
   * Sends a chat message to the given chat room.
   */
  announce: async function (message, room) {
    const USER = '@twms.buildbot:matrix.cbb.de';
    const PASSWORD = process.env.CHAT_BOT_PASSWORD;
    const SERVER = 'https://matrix.cbb.de';

    try {
      const client = sdk.createClient(SERVER);
      await client.login('m.login.password', {
        user: USER,
        password: PASSWORD,
      });
      await client.startClient();
      var messageObject = {
        // remove HTML tags for plain text fallback message
        body: message.replace(/<[^>]*>?/gm, ''),
        formatted_body: message,
        msgtype: 'm.text',
        format: 'org.matrix.custom.html',
      };
      await client.sendEvent(room, 'm.room.message', messageObject, '');
      await client.stopClient();
    } catch(error) {
      console.error(error);
    }

    process.exit();
  }
}
