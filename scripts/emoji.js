module.exports = {
    config: {
        name: "emoji",
        aliases: ["emojipng", "emojitopng"],
        version: "2.0",
        author: "ASIF",
        countDown: 1,
        role: 0,
        description: {
            en: "𝗘𝗺𝗼𝗷𝗶 𝘁𝗼 𝗘𝗺𝗼𝗷𝗶 𝗣𝗻𝗴"
        },
        category: "𝗢𝗪𝗡𝗘𝗥",
        guide: {
            en: "{pn} [emoji] | [size] - Supported sizes are 32, 64, and 128"
        }
    },

    onStart: async function ({ api, args, message, event}) {
        const [emoji_arg, size] =  (args.join(' ')).split('|').map(item => item.trim());
        let emoji = '';
        if(!emoji_arg && event.messageReply.body) {
            emoji = event.messageReply.body;
        }else {
            emoji = emoji_arg;
        }
        if(!emoji || !size){                    
            return message.reply("❎ | 𝙿𝚕𝚎𝚊𝚜𝚎 𝙿𝚛𝚘𝚟𝚒𝚍𝚎 𝚊 𝙴𝚖𝚘𝚓𝚒 & 𝚂𝚒𝚣𝚎");
        }
        try {
            const emojiPngUrl = await api.getEmojiUrl(emoji, size);
            await message.reply({ body: `✅ | 𝙴𝚖𝚘𝚓𝚒 𝚄𝚁𝙻: ${emojiPngUrl}`, attachment: await global.utils.getStreamFromURL(emojiPngUrl) });

        } catch (error) {
            console.log(error);
            return message.reply(`❎ | 𝙴𝚛𝚛𝚘𝚛: ${error.message}`);
        }
    }
};