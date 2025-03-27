const fs = require("fs");
const moment = require("moment-timezone");

const birthdayDataPath = "birthdays.json";
const tid = "9481265011934435";

let userLastSent = {};

function addUserBirthday(userId, name, date) {
    let data = fs.existsSync(birthdayDataPath) ? JSON.parse(fs.readFileSync(birthdayDataPath, "utf-8")) : {};
    data[userId] = { name, date };
    fs.writeFileSync(birthdayDataPath, JSON.stringify(data, null, 2));

    return `✅ ${name}'s birthday is saved on ${date}!`;
}

function listBirthdays() {
    if (!fs.existsSync(birthdayDataPath)) return "❌ No birthdays saved!";
    let data = JSON.parse(fs.readFileSync(birthdayDataPath, "utf-8"));

    if (Object.keys(data).length === 0) return "❌ No birthdays saved!";

    let sortedData = Object.values(data).sort((a, b) => {
        const [monthA, dayA] = a.date.split("-").map(Number);
        const [monthB, dayB] = b.date.split("-").map(Number);
        return monthA - monthB || dayA - dayB;
    });

    let list = " Happy Birthday List ✨\n\nUser name:   MM-DD\n";
    for (let entry of sortedData) {
        let paddedName = entry.name.padEnd(10);
        let paddedDate = entry.date.padStart(5);
        list += `👤 ${paddedName}  ${paddedDate}\n`;
    }
    return list;
}

function hasSentRecently(userId) {
    if (userLastSent[userId]) {
        const lastSentTime = userLastSent[userId];
        const currentTime = moment().tz("Asia/Dhaka");
        const diffInMinutes = currentTime.diff(lastSentTime, 'minutes');
        return diffInMinutes < 1;
    }
    return false;
}

function markAsSent(userId) {
    userLastSent[userId] = moment().tz("Asia/Dhaka");
    setTimeout(() => {
        delete userLastSent[userId];
    }, 60000);
}

module.exports = {
    config: {
        name: "birthday",
        version: "1.2",
        author: "Bokkor",
        category: "utility",
        usage: "[add @user MM-DD] | [add UID MM-DD] | [list]",
        description: "Save birthdays, view the list, and send automatic wishes in a specific thread.",
    },

    onStart: async function ({ message, args, usersData, api }) {
        if (args[0] === "add") {
            let userId, name;
            let date = args[3];

            if (args[1] && args[2] && /^\d{2}-\d{2}$/.test(date)) {
                userId = args[1];
                name = args[2];
            } else if (Object.keys(message.mentions || {}).length > 0) {
                userId = Object.keys(message.mentions)[0];
                name = usersData[userId]?.name || "User";
            } else if (/^\d+$/.test(args[1])) {
                userId = args[1];
                name = usersData[userId]?.name || "User";
            } else {
                return message.reply("❌ Please provide the UID, name, and a valid date in MM-DD format!");
            }

            if (!date || !/^\d{2}-\d{2}$/.test(date)) {
                return message.reply("❌ Please provide the date in MM-DD format!");
            }

            let response = addUserBirthday(userId, name, date);
            message.reply(response);
        } else if (args[0] === "list") {
            let response = listBirthdays();
            message.reply(response);
        } else {
            message.reply("⚡ Usage:\n- **birthday add UID name MM-DD** (Save birthday with UID and name)\n- **birthday list** (View saved birthdays)");
        }
    },

    onChat: async function ({ api, usersData }) {
        try {
            const today = moment().tz("Asia/Dhaka");
            const todayDate = today.format("MM-DD");

            if (today.hours() !== 0 || today.minutes() !== 0) return;

            if (!fs.existsSync(birthdayDataPath)) return;
            const birthdays = JSON.parse(fs.readFileSync(birthdayDataPath, "utf-8"));

            let sent = false;
            for (const userID in birthdays) {
                const user = birthdays[userID];

                if (user.date === todayDate && !hasSentRecently(userID)) {
                    try {
                        const data = await usersData.get(userID);
                        const userName = data?.name || user.name || "User";
                        const birthdayMsg = `𝑯𝒂𝒑𝒑𝒚 𝑩𝒊𝒓𝒕𝒉𝒅𝒂𝒚, ${userName}! 𝑾𝒊𝒔𝒉 𝒚𝒐𝒖 𝒎𝒂𝒏𝒚 𝒎𝒂𝒏𝒚 𝒉𝒂𝒑𝒑𝒚 𝒓𝒆𝒕𝒖𝒓𝒏𝒔 𝒐𝒇 𝒕𝒉𝒆 𝒅𝒂𝒚❣️🌼🌻 G𝐨𝐝 𝐛𝐥𝐞𝐬𝐬𝐲𝐨𝐮 𝐚𝐥𝐰𝐚𝐲𝐬♡︎☺︎︎
𝐈 𝐰𝐚𝐧𝐭 𝐭𝐨 𝐰𝐢𝐬𝐡 𝐲𝐨𝐮𝐫 𝐡𝐚𝐩𝐩𝐲 𝐥𝐢𝐟𝐞 🌻❣️🌎❤️
𝐀𝐥𝐰𝐚𝐲𝐬 keep 𝐬𝐦𝐢𝐥𝐞 😊 on your  face❤`;

                        api.sendMessage({ body: birthdayMsg, mentions: [{ tag: userName, id: userID }] }, tid);
                        console.log(`✅ Birthday wish sent to ${userName}`);
                        sent = true;
                        markAsSent(userID);
                    } catch (error) {
                        console.error(`❌ Error sending birthday wish to ${userID}:`, error);
                    }
                }
            }

            if (sent) console.log("✅ Birthday wishes sent today.");
        } catch (error) {
            console.error("❌ Error:", error);
        }
    }
};