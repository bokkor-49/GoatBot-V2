module.exports = {
  config: {
    name: 'ckban',
    version: '1.1',
    author: 'MahMUD',
    countDown: 15,
    role: 0,
    category: 'general',
    guide: {
      en: '{pn}: Check if the bot is media banned.'
    }
  },

  onStart: async function ({ message, api, event }) {
    try {
      const permission = global.GoatBot.config.owner;
      if (!permission.includes(event.senderID)) {
        return api.sendMessage("❌ You do not have permission to use this command.", event.threadID, event.messageID);
      }

      const checkImageURL = "https://i.ibb.co/2ntpM69/image.jpg";
      const checkMessage = await message.reply("Checking media ban 🐤");

      try {
        const attachment = await global.utils.getStreamFromURL(checkImageURL);

        if (!attachment) {
          throw new Error("Failed to create attachment. Stream is null or undefined.");
        }

        await message.reply({
          body: "Media not banned ✅",
          attachment: attachment
        });

        await api.editMessage("✅ The bot's media is not banned.", checkMessage.messageID);
      } catch (error) {
        console.error("Error encountered:", error.message || error);
        await api.editMessage("❌ The bot's media has been banned or an error occurred.", checkMessage.messageID);
      }
    } catch (outerError) {
      console.error("Outer error encountered:", outerError.message || outerError);
    }
  }
};