const axios = require("axios");

module.exports.config = {
  name: "art",
  version: "2.0",
  role: 0,
  author: "Bokkor",
  description: " Image Generator",
  category: "𝗜𝗠𝗔𝗚𝗘 𝗚𝗘𝗡𝗘𝗥𝗔𝗧𝗢𝗥",
  premium: true,
  guide: "{pn} [prompt] --ratio 1024x1024\n{pn} [prompt]",
  countDown: 15,
};

module.exports.onStart = async ({ event, args, api }) => {
  const dipto = "https://art-bokkor.onrender.com/art"; // এখানে আপনার API URL ব্যবহার করেছি

  try {
    const prompt = args.join(" ");
    const [prompt2, ratio = "1024x1024"] = prompt.includes("--ratio")
      ? prompt.split("--ratio").map(s => s.trim())
      : [prompt, "1024x1024"];

    const startTime = Date.now();
    
    const waitMessage = await api.sendMessage("𝐆𝐞𝐧𝐞𝐫𝐚𝐭𝐢𝐧𝐠 𝐢𝐦𝐚𝐠𝐞, 𝐩𝐥𝐞𝐚𝐬𝐞 𝐰𝐚𝐢𝐭... 😘", event.threadID);
    api.setMessageReaction("⌛", event.messageID, () => {}, true);

    const apiurl = `${dipto}?prompt=${encodeURIComponent(prompt2)}&ratio=${encodeURIComponent(ratio)}`; // নতুন API URL
    const response = await axios.get(apiurl, { responseType: "stream" });

    const timeTaken = ((Date.now() - startTime) / 1000).toFixed(2);

    api.setMessageReaction("✅", event.messageID, () => {}, true);
    api.unsendMessage(waitMessage.messageID);

    api.sendMessage({
      body: `𝐇𝐞𝐫𝐞'𝐬 𝐲𝐨𝐮𝐫 𝐢𝐦𝐚𝐠𝐞 𝐛𝐛𝐲 😘\n (𝐆𝐞𝐧𝐞𝐫𝐚𝐭𝐞𝐝 𝐢𝐧 ${timeTaken} 𝐬𝐞𝐜𝐨𝐧𝐝𝐬)`,
      attachment: response.data,
    }, event.threadID, event.messageID);
    
  } catch (e) {
    console.error(e);
    api.sendMessage("Error: " + e.message, event.threadID, event.messageID);
  }
};