module.exports = {
  config: {
    name: "cover",
    aliases: ["coverphoto"],
    version: "1.0",
    author: "NIB",
    countDown: 5,
    role: 0,
    shortDescription: "Get COVER image",
    longDescription: "Fetch the COVER photo of a tagged user or yourself",
    category: "image",
    guide: {
      en: "{pn} @tag"
    }
  },

  langs: {
    en: {
      noTag: "You must tag the person you want to get the cover photo of",
      noCover: "Unable to fetch cover photo of this user"
    }
  },

  onStart: async function ({ event, message, usersData, args, getLang }) {
    let coverUrl;
    const uid1 = event.senderID;
    const uid2 = Object.keys(event.mentions)[0];

    let targetUID = uid2 || uid1; // যদি ট্যাগ করা না হয়, তবে নিজেই টার্গেট হবে

    // কভার ফটো আনার চেষ্টা করবে
    if (usersData.getCoverUrl) {
      coverUrl = await usersData.getCoverUrl(targetUID);
    }

    // যদি কভার ফটো না পাওয়া যায়, তাহলে ত্রুটি বার্তা পাঠাবে
    if (!coverUrl) {
      return message.reply(getLang("noCover"));
    }

    message.reply({
      body: "Here is the cover photo:",
      attachment: await global.utils.getStreamFromURL(coverUrl)
    });
  }
};