const PastebinAPI = require('pastebin-js');
const fs = require('fs');
const path = require('path');

module.exports = {
  config: {
    name: "bin",
    version: "1.0",
    author: "SANDIP",
    countDown: 5,
    role: 0,
    shortDescription: {
      en: "Upload files to pastebin and sends link"
    },
    longDescription: {
      en: "This command allows you to upload files to pastebin and sends the link to the file."
    },
    category: "owner",
    guide: {
      en: "To use this command, type !pastebin <filename>. The file must be located in the 'cmds' folder."
    }
  },

  onStart: async function({ api, event, args }) {
    if (args.length === 0) {
      return api.sendMessage('⚠️ Please provide a file name!', event.threadID);
    }

    const fileName = args[0].trim(); // ফাইলের নাম থেকে অপ্রয়োজনীয় স্পেস সরানো
    if (!fileName) {
      return api.sendMessage('⚠️ Invalid file name!', event.threadID);
    }

    const permission = global.GoatBot.config.DEV;
    if (!permission.includes(event.senderID)) {
      return api.sendMessage('⛔ You don\'t have permission to use this command!', event.threadID);
    }

    const pastebin = new PastebinAPI({
      api_dev_key: 'LFhKGk5aRuRBII5zKZbbEpQjZzboWDp9',
      api_user_key: 'LFhKGk5aRuRBII5zKZbbEpQjZzboWDp9',
    });

    const filePathWithoutExtension = path.join(__dirname, '..', 'cmds', fileName);
    const filePathWithExtension = path.join(__dirname, '..', 'cmds', fileName + '.js');

    let filePath;
    if (fs.existsSync(filePathWithoutExtension)) {
      filePath = filePathWithoutExtension;
    } else if (fs.existsSync(filePathWithExtension)) {
      filePath = filePathWithExtension;
    } else {
      return api.sendMessage('❌ File not found!', event.threadID);
    }

    fs.readFile(filePath, 'utf8', async (err, data) => {
      if (err) {
        console.error(err);
        return api.sendMessage('❌ Error reading file!', event.threadID);
      }

      try {
        const paste = await pastebin.createPaste({
          text: data,
          title: fileName,
          format: null,
          privacy: 1,
        });

        const rawPaste = paste.replace("pastebin.com", "pastebin.com/raw");
        api.sendMessage(`✅ File uploaded: ${rawPaste}`, event.threadID);
      } catch (error) {
        console.error(error);
        api.sendMessage('❌ Error uploading to Pastebin!', event.threadID);
      }
    });
  },
};
