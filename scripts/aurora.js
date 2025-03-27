const axios = require("axios");

module.exports.config = {
  name: "aurora",
  version: "1.0",
  role: 2,
  author: "Bokkor",
  description: "Aurora Image Generator",
  category: "𝗜𝗠𝗔𝗚𝗘 𝗚𝗘𝗡𝗘𝗥𝗔𝗧𝗢𝗥",
  premium: true,
  guide: "{pn} [prompt]",
  countDown: 15,
};

module.exports.onStart = async ({ event, args, api }) => {
  const apiUrl = "https://renzweb.onrender.com/api/aurora";

  try {
    const prompt = args.join(" ") || "girl";

    const startTime = Date.now();
    const waitMessage = await api.sendMessage("Generating image, please wait... 😘", event.threadID);
    api.setMessageReaction("⌛", event.messageID, () => {}, true);

    const response = await axios.get(`${apiUrl}?prompt=${encodeURIComponent(prompt)}`, { responseType: "stream" });

    const timeTaken = ((Date.now() - startTime) / 1000).toFixed(2);

    api.setMessageReaction("✅", event.messageID, () => {}, true);
    api.unsendMessage(waitMessage.messageID);

    api.sendMessage({
      body: `Here's your image (Generated in ${timeTaken} seconds)`,
      attachment: response.data,
    }, event.threadID, event.messageID);
    
  } catch (e) {
    console.error(e);
    api.sendMessage("Error: " + e.message, event.threadID, event.messageID);
  }
};