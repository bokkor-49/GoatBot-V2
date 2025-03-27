const axios = require('axios');
const fs = require('fs');
const path = require('path');

module.exports = {
  config: {
    name: "e2g",
    aliases: ["emoji2gif"],
    version: "1.0",
    author: "ASIF",
    countDown: 2,
    role: 0,
    description: "Convert emoji to GIF",
    category: "FUN",
    guide: "{pn} [emoji]"
  },

  onStart: async function ({ message, args }) {
    if (!args[0]) {
      return message.reply("❌ Please provide an emoji to convert to GIF.");
    }

    const emoji = encodeURIComponent(args[0]);
    const imageUrl = `https://api.zetsu.xyz/emoji2gif?q=${emoji}`;
    const imagePath = path.join(__dirname, 'tmp', `${emoji}.gif`);

    try {
      const response = await axios({
        url: imageUrl,
        responseType: 'stream'
      });
      
      response.data.pipe(fs.createWriteStream(imagePath)).on('finish', async () => {
        await message.reply({
          body: "Here is your emoji GIF! 🎭",
          attachment: fs.createReadStream(imagePath)
        });
      });
    } catch (error) {
      console.error("Error while processing command:", error);
      await message.reply("❌ An error occurred while processing the request.");
    }
  }
};