const axios = require("axios");

module.exports = {
  config: {
    name: "ai",
    version: "1.0",
    author: "Bokkor",
    description: "AI Assistant - Liner AI",
    category: "AI",
    countDown: 5,
    role: 0,
    guide: "{pn} [question] | [reply with a message]",
  },

  onStart: async ({ api, event, args }) => {
    const prompt = args.join(" ").trim();
    const author = event.senderID;

    if (!prompt) {
      return api.sendMessage("❌ Please provide a prompt or reply to a message.", event.threadID, event.messageID);
    }

    try {
      const response = await axios.get(`https://api.zetsu.xyz/api/liner?q=${encodeURIComponent(prompt)}`);

      if (response.data && response.data.result) {
        const message = response.data.result;

        // AI রিপ্লাই ট্র্যাক করার জন্য সেট করা
        await api.sendMessage(message, event.threadID, (err, info) => {
          if (!err) {
            global.GoatBot.onReply.set(info.messageID, {
              commandName: "ai",
              type: "reply",
              messageID: info.messageID,
              author
            });
          }
        }, event.messageID);
      } else {
        api.sendMessage("⚠️ No valid response from the AI.", event.threadID, event.messageID);
      }

    } catch (error) {
      console.error("❌ Error:", error.message);
      api.sendMessage(`❌ Error: ${error.message}`, event.threadID, event.messageID);
    }
  },

  onReply: async ({ api, event, Reply }) => {
    if (Reply.author !== event.senderID) return;
    const replyMessage = event.body.trim();
    if (!replyMessage) return;

    try {
      const response = await axios.get(`https://api.zetsu.xyz/api/liner?q=${encodeURIComponent(replyMessage)}`);
      if (response.data && response.data.result) {
        await api.sendMessage(response.data.result, event.threadID, (err, info) => {
          if (!err) {
            global.GoatBot.onReply.set(info.messageID, {
              commandName: "ai",
              type: "reply",
              messageID: info.messageID,
              author: event.senderID
            });
          }
        }, event.messageID);
      }
    } catch (error) {
      console.error("❌ Error:", error.message);
      api.sendMessage(`❌ Error: ${error.message}`, event.threadID, event.messageID);
    }
  }
};