const { GoatWrapper } = require("fca-liane-utils");
const axios = require("axios");

module.exports = {
  config: {
    name: "ailyrics",
    aliases: [],
    version: "1.0",
    author: "Bokkor",
    countDown: 5,
    role: 0,
    shortDescription: "Generate AI lyrics",
    longDescription: "Generate AI-based lyrics using a given prompt.",
    category: "music",
    guide: {
      en: "{p}ailyrics <prompt>"
    }
  },

  onStart: async function ({ message, event, args }) {
    const prompt = args.join(" ");
    if (!prompt) {
      return message.reply("❌ Please provide a prompt for the lyrics.");
    }

    try {
      const apiUrl = `https://api.zetsu.xyz/api/ailyrics?prompt=${encodeURIComponent(prompt)}`;
      const response = await axios.get(apiUrl);

      if (response.data && response.data.lyrics) {
        message.reply(response.data.lyrics);
      } else {
        message.reply("❌ Failed to generate lyrics. Try a different prompt.");
      }
    } catch (error) {
      console.error(error);
      message.reply("❌ An error occurred while generating lyrics.");
    }
  }
};

const wrapper = new GoatWrapper(module.exports);
wrapper.applyNoPrefix({ allowPrefix: true });