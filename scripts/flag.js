const axios = require('axios');
const flagApiBase = "https://flag-game-y7rm.onrender.com/flag";

module.exports = {
  config: {
    name: "flag",
    aliases: ["flagGame"],
    version: "3.0",
    author: "Bokkor",
    countDown: 0,
    role: 0,
    description: {
      en: "Guess the flag name",
    },
    category: "game",
    guide: {
      en: "{pn}",
    },
  },

  onStart: async function ({ api, args, event, threadsData, usersData }) {
    try {
      const userID = event.senderID;
      const threadData = await threadsData.get(event.threadID);
      const userGames = threadData.data[userID] || { gamesPlayed: 0, lastPlayed: 0 };
      const currentTime = Date.now();
      const limitReached = userGames.gamesPlayed >= 15;
      const hoursSinceLastGame = (currentTime - userGames.lastPlayed) / (1000 * 60 * 60);

      if (limitReached) {
        const hoursLeft = 10 - hoursSinceLastGame;
        return api.sendMessage(
          `❌ | You have reached the 15 games limit. You can play again in ${Math.ceil(hoursLeft)} hours.`,
          event.threadID,
          event.messageID
        );
      }

      if (!args[0]) {
        const res = await axios.get(`${flagApiBase}?flag=flag`);
        const { countryflag, countryname } = res.data;

        await api.sendMessage(
          {
            body: "Guess this flag name.",
            attachment: await global.utils.getStreamFromURL(countryflag),
          },
          event.threadID,
          (error, info) => {
            global.GoatBot.onReply.set(info.messageID, {
              commandName: this.config.name,
              type: "reply",
              messageID: info.messageID,
              author: event.senderID,
              country: countryname.toLowerCase(),
              attempts: 3,
              answeredBy: event.senderID,
            });
          },
          event.messageID
        );

        userGames.gamesPlayed += 1;
        userGames.lastPlayed = currentTime;
        threadData.data[userID] = userGames;
        await threadsData.set(event.threadID, threadData);
      } 
      
      else if (args[0].toLowerCase() === "top") {
        const flagStatsArray = Object.entries(threadData.data.flagWins || {}).sort((a, b) => b[1] - a[1]);
        let message = "🏆 Flag Game Rankings:\n\n";
        for (let i = 0; i < flagStatsArray.length; i++) {
          const userName = await usersData.getName(flagStatsArray[i][0]);
          message += `${i + 1}. ${userName}: ${flagStatsArray[i][1]} wins\n`;
        }
        return api.sendMessage(message, event.threadID, event.messageID);
      } 

      // ✅ LIST ALL FLAGS
      else if (args[0].toLowerCase() === "list") {
        try {
          const res = await axios.get(`${flagApiBase}?flag=list`);
          console.log("List API Response:", res.data); // ✅ Debugging
          
          if (res.data.totalFlags) {
            return api.sendMessage(`📜 Total flags available: ${res.data.totalFlags}`, event.threadID, event.messageID);
          } else {
            return api.sendMessage("❌ | Failed to fetch flag list.", event.threadID, event.messageID);
          }
        } catch (error) {
          console.error("API Error:", error);
          return api.sendMessage("❌ | Error fetching flag list.", event.threadID, event.messageID);
        }
      }

      // ✅ ADD NEW FLAG
      else if (args[0].toLowerCase() === "add") {
        if (args.length < 3) {
          return api.sendMessage("⚠️ Usage: {pn} add [Country Name] [Image URL]", event.threadID, event.messageID);
        }
      
        const countryName = args.slice(1, -1).join(" ");
        const imageUrl = args[args.length - 1];
      
        if (!imageUrl.match(/\.(jpeg|jpg|png|gif)$/)) {
          return api.sendMessage("❌ Please provide a valid image URL (JPEG, PNG, GIF).", event.threadID, event.messageID);
        }
      
        try {
          const res = await axios.get(`${flagApiBase}?flag=addflag&name=${encodeURIComponent(countryName)}&url=${encodeURIComponent(imageUrl)}`);
      
          console.log("Add Flag API Response:", res.data);
          if (res.data.message === "Flag added successfully ✅") {
            return api.sendMessage(`✅ | Flag for "${countryName}" added successfully!`, event.threadID, event.messageID);
          } else {
            return api.sendMessage(`❌ | Failed to add flag: ${res.data.message || "Unknown error"}`, event.threadID, event.messageID);
          }
        } catch (error) {
          console.error("API Error:", error);
          return api.sendMessage("❌ | Failed to add new flag.", event.threadID, event.messageID);
        }
      }      
    } catch (error) {
      console.error(`Error: ${error.message}`);
      api.sendMessage(`❌ | Error: ${error.message}`, event.threadID, event.messageID);
    }
  },

  onReply: async function ({ api, event, Reply, usersData, threadsData }) {
    const { country, attempts, answeredBy } = Reply;
    if (event.senderID !== answeredBy) {
      return api.sendMessage(`❌ | This is not your flag to guess!`, event.threadID, event.messageID);
    }

    const reply = event.body.toLowerCase();
    if (reply === country) {
      await api.unsendMessage(Reply.messageID);
      const userData = await usersData.get(event.senderID);
      await usersData.set(event.senderID, {
        money: userData.money + 840,
        exp: userData.exp + 600,
        data: userData.data,
      });

      const grp = await threadsData.get(event.threadID);
      if (!grp.data.flagWins) grp.data.flagWins = {};
      grp.data.flagWins[event.senderID] = (grp.data.flagWins[event.senderID] || 0) + 1;
      await threadsData.set(event.threadID, grp);

      return api.sendMessage(`✅ | Correct answer! You earned 840 coins and 600 exp.`, event.threadID, event.messageID);
    } else {
      Reply.attempts--;
      if (Reply.attempts > 0) {
        return api.sendMessage(`❌ | Wrong answer. ${Reply.attempts} attempts left. Try again!`, event.threadID, event.messageID);
      } else {
        global.GoatBot.onReply.delete(Reply.messageID);
        return api.sendMessage(`❌ | Game over! The correct answer was **${country}**.`, event.threadID, event.messageID);
      }
    }
  },
};
