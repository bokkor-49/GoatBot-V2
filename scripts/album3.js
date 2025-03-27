const fs = require('fs');
const path = require('path');
const { drive, getStreamFromURL } = global.utils;

// ✅ সঠিকভাবে ডাটা সংরক্ষণের ফাইল পাথ ঠিক করা
const dataFilePath = path.resolve(__dirname || process.cwd(), 'video.json');

// ✅ ফাইল রিডিং ফাংশন ফিক্স
function readData() {
    try {
        if (!fs.existsSync(dataFilePath)) {
            fs.writeFileSync(dataFilePath, JSON.stringify({
                love: [], sad: [], funny: [],
                lofi: [], islamic: [], couple: [],
                freefire: [], girl: [], anime: [], motivational: [], money: []
            }, null, 2), 'utf8');
        }
        return JSON.parse(fs.readFileSync(dataFilePath, 'utf8'));
    } catch (error) {
        console.error('❌ Error reading data file:', error);
        return {
            love: [], sad: [], funny: [],
            lofi: [], islamic: [], couple: [],
            freefire: [], girl: [], anime: [], motivational: [], money: []
        };
    }
}

// ✅ ফাইল লেখার ফাংশন ফিক্স
function writeData(data) {
    try {
        fs.writeFileSync(dataFilePath, JSON.stringify(data, null, 2), 'utf8');
    } catch (error) {
        console.error('❌ Error writing data file:', error);
    }
}

// ✅ অনুমোদিত ক্যাটাগরি ঠিক করা
const validCategories = ['love', 'sad', 'funny', 'lofi', 'islamic', 'couple', 'freefire', 'girl', 'anime', 'motivational', 'money'];

module.exports = {
    config: {
        name: 'album',
        version: '1.5',
        author: 'bokkor',
        role: 0,
        shortDescription: { en: 'Manage categorized videos' },
        longDescription: { en: 'Add and send videos in different categories.' },
        category: 'Video',
        guide: {
            en: '{pn} add love (Reply to a video)\n{pn} love (Send a random love video)\n{pn} album list (Show video count)'
        }
    },

    onStart: async function ({ args, message, event }) {
        let videoData = readData();

        // ✅ ভিডিও যোগ করা
        if (args[0] === 'add') {
            let category = args[1]?.toLowerCase();

            // ✅ ক্যাটাগরি যাচাই
            if (!category || !validCategories.includes(category)) {
                return message.reply('⚠️ Valid categories: love, sad, funny, lofi, islamic, couple, freefire, girl, anime, motivational, money.');
            }

            if (event.messageReply?.attachments?.length > 0) {
                const videoAttachment = event.messageReply.attachments.find(att => att.type === 'video');
                if (!videoAttachment) return message.reply('⚠ 𝗥𝗲𝗽𝗹𝘆 𝘁𝗼 𝗮 𝘃𝗶𝗱𝗲𝗼 𝗳𝗶𝗹𝗲 𝘁𝗼 𝗮𝗱𝗱.');

                const fileName = `video_${Date.now()}.mp4`;
                const infoFile = await drive.uploadFile(fileName, 'application/octet-stream', await getStreamFromURL(videoAttachment.url));

                if (!infoFile?.id) return message.reply('❌ Failed to upload video.');

                // ✅ ভিডিও ডাটা আপডেট করা
                videoData[category].push(infoFile.id);
                writeData(videoData);
                return message.reply(`✅ 𝗩𝗶𝗱𝗲𝗼 𝗮𝗱𝗱𝗲𝗱 𝘁𝗼  "${category}" 𝗰𝗮𝘁𝗲𝗴𝗼𝗿𝘆!`);
            } else {
                return message.reply('⚠ 𝗥𝗲𝗽𝗹𝘆 𝘁𝗼 𝗮 𝘃𝗶𝗱𝗲𝗼 𝗳𝗶𝗹𝗲 𝘁𝗼 𝗮𝗱𝗱.');
            }
        }

        // ✅ ক্যাটাগরি অনুযায়ী ভিডিও পাঠানো
        else if (validCategories.includes(args[0]?.toLowerCase())) {
            let category = args[0].toLowerCase();

            if (videoData[category].length === 0) {
                return message.reply(`⚠ 𝗡𝗼 𝘃𝗶𝗱𝗲𝗼𝘀 𝗶𝗻 "${category}" 𝗰𝗮𝘁𝗲𝗴𝗼𝗿𝘆.`);
            }

            let randomVideoId = videoData[category][Math.floor(Math.random() * videoData[category].length)];
            const videoStream = await drive.getFile(randomVideoId, 'stream', true);

            return message.reply({
                body: `𝙷𝙴𝚁𝙴 𝚈𝙾𝚄𝚁 ${category.toUpperCase()} 𝚅𝙸𝘿𝙴𝙾 𝘽𝘽𝚈 > 😘`,
                attachment: [videoStream]
            });
        }

        // ✅ অ্যালবাম লিস্ট দেখানো
        else if (args.length === 1 && args[0].toLowerCase() === "list") {
            let albumInfo = Object.entries(videoData)
                .map(([category, videos]) => `🔹 **${category.toUpperCase()}**: ${videos.length} videos`)
                .join('\n');

            return message.reply(`𝗔𝗹𝗯𝘂𝗺 𝗟𝗶𝘀𝘁: 😘😘\n\n${albumInfo}`);
        }

        // ✅ ভুল কমান্ডের জন্য বার্তা
        else {
            return message.reply('⚠️ Invalid command. Use "{pn} add [category]" or "{pn} [category]" or "{pn} album list".');
        }
    }
};
