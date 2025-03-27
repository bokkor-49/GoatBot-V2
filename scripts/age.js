const axios = require('axios');

module.exports = {
    config: {
        name: "age",
        aliases: ["birthday", "birthdate"],
        version: "1.0", 
        author: "ʙᴏᴋᴋᴏʀ",
        description: {
            vi: "Lấy thông tin tuổi dựa trên ngày sinh.",
            en: "Get age information based on the birthdate."
        },
        category: "Tools",
        guide: {
            vi: "{pn} <ngày sinh (DD-MM-YYYY)>",
            en: "{pn} <birthdate (DD-MM-YYYY)>"
        }
    },

    onStart: async function ({ api, args, event }) {
        if (!args[0]) return api.sendMessage("📌 Please provide a birthdate! 📅\n\n📝 Format: DD-MM-YYYY", event.threadID);

        const birthdate = args[0].split("-");
        if (birthdate.length !== 3) return api.sendMessage("❌ Invalid format! Please use DD-MM-YYYY format.", event.threadID);

        const [day, month, year] = birthdate;
        const apiUrl = `https://count-age.vercel.app/age-count?year=${year}&month=${month}&day=${day}`;

        try {
            const response = await axios.get(apiUrl);
            const data = response.data;

            const formattedResponse = `
╔══════════════════╗
  🎂 AGE INFO 🎂
╚══════════════════╝
📅 Birthdate: ${args[0]}

✨ ${data.age}

📊 LIFE STATS:
🗓 Days Lived: ${data.lifeStats.daysLived}
⏱ Minutes Lived: ${data.lifeStats.minutesLived}
⏳ Seconds Lived: ${data.lifeStats.secondsLived}

🎉 Next Birthday: ${data.nextBirthday}
`;

            await api.sendMessage(formattedResponse, event.threadID);
        } catch (error) {
            console.error('Error fetching age data:', error);
            api.sendMessage("❌ An error occurred while processing the request!", event.threadID);
        }
    }
};
