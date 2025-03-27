const axios = require('axios');
const fs = require('fs');
const path = require('path');

module.exports = {
  config: {
    name: "affect",
    aliases: ["af"],
    version: "1.0",
    author: "Bokkor",
    countDown: 2,
    role: 0,
    description: "Apply affect filter on user profile picture",
    category: "FUN",
    guide: "{pn} (mention someone/uid/reply to a msg)"
  },

  onStart: async function ({ message, event, args }) {
    const mention = Object.keys(event.mentions);
    let one;
    if (mention.length == 1) {
      one = mention[0];
    } else if (args[0]) {
      one = args[0];
    } else if (event.messageReply) {
      one = event.messageReply.senderID;
    } else {
      return message.reply("❌ Please mention someone or provide a UID.");
    }

    try {
      const imageUrl = `https://api.zetsu.xyz/canvas/affect?uid=${one}`;
      const imagePath = path.join(__dirname, 'tmp', `${one}.jpg`);
      
      const response = await axios({
        url: imageUrl,
        responseType: 'stream'
      });
      
      response.data.pipe(fs.createWriteStream(imagePath)).on('finish', async () => {
        await message.reply({
          body: "😘👀",
          attachment: fs.createReadStream(imagePath)
        });
      });
    } catch (error) {
      console.error("Error while processing command:", error);
      await message.reply("❌ An error occurred while processing the request.");
    }
  }
};