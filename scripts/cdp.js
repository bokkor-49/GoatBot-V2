const fs = require('fs');
const path = require('path');
const { drive, getStreamFromURL } = global.utils;

const dataFilePath = path.resolve(__dirname || process.cwd(), 'cdp.json');

function readData() {
    try {
        if (!fs.existsSync(dataFilePath)) {
            fs.writeFileSync(dataFilePath, JSON.stringify([], null, 2), 'utf8');
        }
        return JSON.parse(fs.readFileSync(dataFilePath, 'utf8'));
    } catch (error) {
        console.error('❌ Error reading data file:', error);
        return [];
    }
}

function writeData(data) {
    try {
        fs.writeFileSync(dataFilePath, JSON.stringify(data, null, 2), 'utf8');
    } catch (error) {
        console.error('❌ Error writing data file:', error);
    }
}

module.exports = {
    config: {
        name: 'cdp',
        version: '1.1',
        author: 'bokkor',
        role: 0,
        shortDescription: { en: 'Manage couple DP images' },
        longDescription: { en: 'Add and send couple DP images.' },
        category: 'custom',
        guide: {
            en: '{pn} add (Reply to two photos to add both)\n{pn} (Send a random couple DP pair)\n{pn} list (Show DP count)'
        }
    },

    onStart: async function ({ args, message, event }) {
        let dpData = readData();

        if (args[0] === 'add') {
            if (event.messageReply?.attachments?.length >= 2) {
                const images = event.messageReply.attachments.filter(att => att.type === 'photo');
                if (images.length < 2) return message.reply('⚠ Reply to exactly two photos to add.');
                
                const fileIds = [];
                for (const image of images) {
                    const fileName = `cdp_${Date.now()}.jpg`;
                    const infoFile = await drive.uploadFile(fileName, 'image/jpeg', await getStreamFromURL(image.url));
                    if (!infoFile?.id) return message.reply('❌ Failed to upload one of the images.');
                    fileIds.push(infoFile.id);
                }
                
                dpData.push(fileIds);
                writeData(dpData);
                return message.reply('✅ Couple DP pair added successfully!');
            } else {
                return message.reply('⚠ Reply to exactly two photos to add a couple DP.');
            }
        }

        else if (args.length === 1 && args[0].toLowerCase() === "list") {
            return message.reply(`𝗧𝗼𝘁𝗮𝗹 𝗖𝗼𝘂𝗽𝗹𝗲 𝗗𝗣𝗦: ${dpData.length}`);
        }

        else {
            if (dpData.length === 0) {
                return message.reply('⚠ No couple DP available.');
            }

            let randomDpPair = dpData[Math.floor(Math.random() * dpData.length)];
            const dpStreams = await Promise.all(randomDpPair.map(id => drive.getFile(id, 'stream', true)));

            return message.reply({
                body: '💑 𝗛𝗲𝗿𝗲 𝗶𝘀 𝘆𝗼𝘂𝗿 𝗖𝗼𝘂𝗽𝗹𝗲 𝗗𝗣! 💕',
                attachment: dpStreams
            });
        }
    }
};