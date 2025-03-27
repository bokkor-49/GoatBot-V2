const axios = require('axios');

const config = {
  name: "deepseek",
  version: "1.0",
  author: "Bokkor",
  description: "AI-powered coding assistant using DeepSeek Coder",
  category: "AI",
  commandCategory: "DeepSeek Coder",
  usePrefix: true,
  prefix: true,
  dependencies: {
    "axios": "",
  },
};

const onStart = async ({ message, event, args, commandName }) => {
  const input = args.join(' ');
  await handleResponse({ message, event, input, commandName });
};

const onReply = async ({ message, event, Reply, args, commandName }) => {
  if (event.senderID !== Reply.author) return;

  const input = args.join(' ');
  await handleResponse({ message, event, input, commandName });
};

async function handleResponse({ message, event, input, commandName }) {
  try {
    const { data } = await axios.get(
      `https://api.zetsu.xyz/ai/deepseek-coder?q=${encodeURIComponent(input)}&uid=55466945`
    );

    return message.reply(data.result, (err, info) => {
      if (!err) {
        // GoatBot reply
        global.GoatBot.onReply.set(info.messageID, {
          commandName,
          messageID: info.messageID,
          author: event.senderID
        });

        // Mirai Bot
        global.client.handleReply.push({
          name: config.name,
          type: "reply",
          messageID: info.messageID,
          author: event.senderID
        });
      }
    });
  } catch (e) {
    message.reply(`❌ Error: ${e.message}`);
  }
}

module.exports = {
  config,
  onStart,
  onReply,
  run: onStart,
  handleReply: onReply,
};