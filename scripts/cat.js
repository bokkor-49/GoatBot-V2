const fs = require('fs');
const path = require('path');
const { drive, getStreamFromURL } = global.utils;

const dataFilePath = path.resolve(__dirname || process.cwd(), 'cat.json');
const sentIndexFilePath = path.resolve(__dirname || process.cwd(), 'cat_sent.json');

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

function readSentIndexes() {
    try {
        if (!fs.existsSync(sentIndexFilePath)) {
            fs.writeFileSync(sentIndexFilePath, JSON.stringify([], null, 2), 'utf8');
        }
        return JSON.parse(fs.readFileSync(sentIndexFilePath, 'utf8'));
    } catch (error) {
        console.error('❌ Error reading sent index file:', error);
        return [];
    }
}

function writeSentIndexes(indexes) {
    try {
        fs.writeFileSync(sentIndexFilePath, JSON.stringify(indexes, null, 2), 'utf8');
    } catch (error) {
        console.error('❌ Error writing sent index file:', error);
    }
}

module.exports = {
    config: {
        name: 'cat',
        version: '1.4',
        author: 'bokkor',
        role: 0,
        shortDescription: { en: 'Manage cat images' },
        longDescription: { en: 'Add and send random cat images when requested.' },
        category: 'custom',
        guide: {
            en: '{pn} add (Reply to multiple photos to add)\n{pn} (Send a random cat image when requested)\n{pn} list (Show total cat images count)'
        }
    },

    onStart: async function ({ args, message, event }) {
        let catData = readData();
        let sentIndexes = readSentIndexes();

        if (args[0] === 'add') {
            if (event.messageReply?.attachments?.length >= 1) {
                const images = event.messageReply.attachments.filter(att => att.type === 'photo');
                if (images.length === 0) return message.reply('⚠ Reply to at least one photo to add.');

                let uploadedCount = 0;
                for (const image of images) {
                    const fileName = `cat_${Date.now()}_${uploadedCount}.jpg`;
                    const infoFile = await drive.uploadFile(fileName, 'image/jpeg', await getStreamFromURL(image.url));
                    if (infoFile?.id) {
                        catData.push(infoFile.id);
                        uploadedCount++;
                    }
                }

                writeData(catData);
                return message.reply(`✅ ${uploadedCount} cat images added successfully!`);
            } else {
                return message.reply('⚠ Reply to one or more photos to add cat images.');
            }
        }

        else if (args.length === 1 && args[0].toLowerCase() === "list") {
            return message.reply(`🐱 𝗧𝗼𝘁𝗮𝗹 𝗖𝗮𝘁 𝗜𝗺𝗮𝗴𝗲𝘀: ${catData.length}`);
        }

        else {
            if (catData.length === 0) {
                return message.reply('⚠ No cat images available.');
            }

            // অব্যবহৃত ছবির লিস্ট বের করা
            let unusedIndexes = catData.map((_, i) => i).filter(i => !sentIndexes.includes(i));

            if (unusedIndexes.length === 0) {
                sentIndexes = []; // সব ছবি দেখানো হয়ে গেলে লিস্ট ক্লিয়ার করে নতুনভাবে চালু করবো
                unusedIndexes = catData.map((_, i) => i);
            }

            // এলোমেলোভাবে যেকোনো একটি ছবি বাছাই করা
            let randomIndex = unusedIndexes[Math.floor(Math.random() * unusedIndexes.length)];
            sentIndexes.push(randomIndex);
            writeSentIndexes(sentIndexes);

            let catImage = catData[randomIndex];
            const catStream = await drive.getFile(catImage, 'stream', true);

            return message.reply({
                body: '🐈 𝗛𝗲𝗿𝗲 𝗶𝘀 𝗮 𝗿𝗮𝗻𝗱𝗼𝗺 𝗰𝗮𝘁 𝗳𝗼𝗿 𝘆𝗼𝘂! 😻',
                attachment: catStream
            });
        }
    }
};