module.exports = {
  config: {
    name: "bio",
    version: "1.7",
    author: "xemon",
    countDown: 5,
    role: 2,
    shortDescription: {
      vi: " ",
      en: "change bot bio ",
    },
    longDescription: {
      vi: " ",
      en: "change bot bio ",
    },
    category: "owner",
    guide: {
      en: "{pn} (text)",
    },
  },
  onStart: async function ({ args, message, api }) {
    const permission = global.GoatBot.config.adminBot;
        if (!permission.includes(event.senderID)) {
            return message.reply("❌ ᴏɴʟʏ ʙᴏᴛ ᴏᴡɴᴇʀ ᴄᴀɴ ᴜsᴇ. ᴛʏᴘᴇ !ɪɴꜰᴏ ꜰᴏʀ ᴏᴡɴᴇʀ ɪɴꜰᴏ ");
        }
    api.changeBio(args.join(" "));
    message.reply("change bot bio to:" + args.join(" "));
  },
};