const axios = require("axios");

module.exports.config = {
  name: "binarytext",
  version: "1.0",
  role: 0,
  author: "Bokkor",
  description: "Binary to Text Conversion",
  category: "𝗕𝗜𝗡𝗔𝗥𝗬 𝗧𝗢 𝗧𝗘𝗫𝗧",
  premium: false,
  guide: "{pn} [binary]",
  countDown: 10,
};

module.exports.onStart = async ({ event, args, api }) => {
  const dipto = "https://rubish-apihub.onrender.com/rubish//binary-text"; // API URL বাইনারি থেকে টেক্সট রূপান্তর করার জন্য
  const apikey = "rubish69"; // API KEY

  try {
    const binaryText = args.join(" "); // বাইনারি ইনপুট
    if (!binaryText) {
      return api.sendMessage("❌ Please provide binary data to convert to text.", event.threadID, event.messageID);
    }

    const startTime = Date.now();

    const waitMessage = await api.sendMessage("🔄 𝐆𝐞𝐧𝐞𝐫𝐚𝐭𝐢𝐧𝐠 𝐭𝐞𝐱𝐭... Please wait...", event.threadID);
    api.setMessageReaction("⌛", event.messageID, () => {}, true);

    const apiurl = `${dipto}?binary=${encodeURIComponent(binaryText)}&apikey=${apikey}`; // API URL তৈরি
    const response = await axios.get(apiurl); // বাইনারি থেকে টেক্সট রূপান্তর API কল করা হচ্ছে

    const timeTaken = ((Date.now() - startTime) / 1000).toFixed(2); // সময় হিসেব করা

    api.setMessageReaction("✅", event.messageID, () => {}, true);
    api.unsendMessage(waitMessage.messageID);

    const textOutput = response.data.text; // টেক্সট আউটপুট

    api.sendMessage({
      body: `𝐇𝐞𝐫𝐞'𝐬 𝐲𝐨𝐮𝐫 𝐭𝐞𝐱𝐭 😘\n(𝐆𝐞𝐧𝐞𝐫𝐚𝐭𝐞𝐝 𝐢𝐧 ${timeTaken} 𝐬𝐞𝐜𝐨𝐧𝐝𝐬)\n\n${textOutput}`,
    }, event.threadID, event.messageID);
    
  } catch (e) {
    console.error(e);
    api.sendMessage("Error: " + e.message, event.threadID, event.messageID);
  }
};