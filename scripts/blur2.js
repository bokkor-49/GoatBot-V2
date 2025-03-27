module.exports = {
    config: {
        name: "blur",
        version: "2.2",
        author: "ASIF",
        countDown: 3,
        role: 0,
        description: {
            en: "Blur Image with custom level"
        },
        category: "IMAGE",
        guide: {
            en: "{pn} [ImgReply/imgLink] [blurLevel]"
        }
    },

    onStart: async function ({ api, args, message, event }) {
        try {
            let imageUrl = "";
            let blurLevel = 5; // Default blur level 5

            if (event.type === "message_reply" && event.messageReply.attachments) {
                imageUrl = event.messageReply.attachments[0].url;
                if (args[0]) blurLevel = parseInt(args[0]);
            } else if (args.length === 1 && !isNaN(args[0])) {
                blurLevel = parseInt(args[0]);
            } else if (args.length > 0) {
                imageUrl = args[0];
                if (args[1] && !isNaN(args[1])) blurLevel = parseInt(args[1]);
            } else {
                return message.reply("❎ | 𝐏𝐥𝐞𝐚𝐬𝐞 𝐫𝐞𝐩𝐥𝐲 𝐭𝐨 𝐚𝐧 𝐢𝐦𝐚𝐠𝐞 𝐨𝐫 𝐩𝐫𝐨𝐯𝐢𝐝𝐞 𝐚𝐧 𝐢𝐦𝐚𝐠𝐞 𝐔𝐑𝐋.");
            }

            if (!imageUrl) return message.reply("❎ | 𝐈𝐧𝐯𝐚𝐥𝐢𝐝 𝐢𝐦𝐚𝐠𝐞 𝐔𝐑𝐋.");
            if (isNaN(blurLevel) || blurLevel < 1 || blurLevel > 50) {
                return message.reply("❎ | 𝐏𝐥𝐞𝐚𝐬𝐞 𝐩𝐫𝐨𝐯𝐢𝐝𝐞 𝐚 𝐛𝐥𝐮𝐫 𝐥𝐞𝐯𝐞𝐥 𝐛𝐞𝐭𝐰𝐞𝐞𝐧 𝟏 𝐚𝐧𝐝 𝟓𝟎.");
            }

            api.setMessageReaction("⏳", event.messageID, (err) => {}, true);
            let waitMsg = await message.reply("⏳ | 𝐏𝐫𝐨𝐜𝐞𝐬𝐬𝐢𝐧𝐠 𝐲𝐨𝐮𝐫 𝐢𝐦𝐚𝐠𝐞, 𝐩𝐥𝐞𝐚𝐬𝐞 𝐰𝐚𝐢𝐭 𝐛𝐛𝐲 >𝟔😘");
    
            const imgStream = `https://rubish-apihub.onrender.com/rubish/edit-blur?url=${encodeURIComponent(imageUrl)}&blurLevel=${blurLevel}&apikey=rubish69`;
    
            api.setMessageReaction("✅", event.messageID, (err) => {}, true);
            message.unsend(waitMsg.messageID);
            message.reply({
                body: `✅ | 𝐇𝐞𝐫𝐞'𝐬 𝐲𝐨𝐮𝐫 𝐛𝐥𝐮𝐫𝐫𝐞𝐝 𝐢𝐦𝐚𝐠𝐞 𝐰𝐢𝐭𝐡 𝐥𝐞𝐯𝐞𝐥 ${blurLevel} 🔥`,
                attachment: await global.utils.getStreamFromURL(imgStream)
            });
        } catch (error) {
            console.error(error);
            message.reply(`❎ | Error: ${error.message}`);
        }
    }
};
