const { findUid } = global.utils;
const fs = require("fs");
const regExCheckURL = /^(http|https):\/\/[^ "]+$/;

// ব্লক করা ইউজারদের ডাটা ফাইল
const BLOCKED_USERS_FILE = "./blockedUsers.json";

// ব্লক লিস্ট লোড করা
const loadBlockedUsers = () => {
    if (fs.existsSync(BLOCKED_USERS_FILE)) {
        return JSON.parse(fs.readFileSync(BLOCKED_USERS_FILE, "utf8"));
    }
    return [];
};

// ব্লক লিস্ট সংরক্ষণ করা
const saveBlockedUsers = (data) => {
    fs.writeFileSync(BLOCKED_USERS_FILE, JSON.stringify(data, null, 2));
};

module.exports = {
    config: {
        name: "block",
        aliases: ["blk"],
        version: "3.3",
        author: "ASIF",
        countDown: 1,
        role: 2,
        description: {
            en: "Auto Block on Reply or Mention + Manual Block/Unblock + Block List"
        },
        category: "OWNER",
        guide: {
            en: "{pn} [block/unblock/list] [userId/reply/mention] or just reply/mention for auto-block"
        }
    },

    onStart: async function ({ api, args, message, event }) {
        const action = args[0]?.toLowerCase();
        let userID = "";

        // যদি কেউ রিপ্লাই করে, তাকে ব্লক করা হবে
        if (event.type == 'message_reply') {
            userID = event.messageReply.senderID;
        } 
        // যদি কেউ মেনশন করে, তাকে ব্লক করা হবে
        else if (Object.keys(event.mentions).length > 0) {
            userID = Object.keys(event.mentions)[0];
        } 
        // ম্যানুয়ালি ইনপুট দিলে সেটি ব্লক হবে
        else if (args[1]?.match(regExCheckURL)) {
            try {
                userID = await findUid(args[1]);
            } catch (e) {
                console.log(e.message);
            }
        } 
        else {
            userID = args[1];
        }

        // ব্লক করা ইউজার লোড করা
        let blockedUsers = loadBlockedUsers();

        // ব্লক লিস্ট চেক করার অপশন
        if (action === "list") {
            if (blockedUsers.length === 0) {
                return message.reply("🚫 | No users are blocked.");
            }
            let userList = blockedUsers.map(user => `👤 Name: ${user.name}\n🔹 UID: ${user.id}`).join("\n\n");
            return message.reply(`📜 | Blocked Users List:\n\n${userList}`);
        }

        if (!userID) {
            return message.reply("❎ | Please Provide a UserID or Mention/Reply to Block.");
        }

        // ব্লক কমান্ড (অটো বা ম্যানুয়াল)
        if (!action || action === "block") {
            if (blockedUsers.some(user => user.id === userID)) {
                return message.reply("❎ | This user is already blocked.");
            }
            try {
                let userInfo = await api.getUserInfo(userID);
                let userName = userInfo[userID]?.name || `User-${userID}`;

                await api.changeBlockedStatus(userID, true);
                blockedUsers.push({ id: userID, name: userName });
                saveBlockedUsers(blockedUsers);
                return message.reply(`✅ | Successfully Blocked User: ${userName} (${userID})`);
            } catch (error) {
                console.log(error);
                return message.reply(`❎ | Error: ${error.message}`);
            }
        } 
        
        // আনব্লক কমান্ড
        if (action === "unblock") {
            if (!blockedUsers.some(user => user.id === userID)) {
                return message.reply("❎ | This user is not blocked.");
            }
            try {
                await api.changeBlockedStatus(userID, false);
                blockedUsers = blockedUsers.filter(user => user.id !== userID);
                saveBlockedUsers(blockedUsers);
                return message.reply(`✅ | Successfully Unblocked User: ${userID}`);
            } catch (error) {
                console.log(error);
                return message.reply(`❎ | Error: ${error.message}`);
            }
        }

        return message.reply("❎ | Invalid Command. Use: block/unblock/list");
    }
};