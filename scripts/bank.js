const fs = require("fs");
const path = require("path");

module.exports = {
  config: {
    name: "bank",
    version: "1.2",
    description: "Deposit or withdraw money from the bank and earn interest",
    guide: {
      vi: "",
      en: "{pn}Bank:\nInterest - Balance\n - Withdraw \n- Deposit \n- Transfer \n- top"
    },
    category: "economy",
    countDown: 5,
    role: 0,
    author: "Loufi | SiAM | Samuel\n\nModified: Bokkor",
  },
  onStart: async function ({ args, message, event, api, usersData }) {
    const { getPrefix } = global.utils;
    const p = getPrefix(event.threadID);

    const userMoney = await usersData.get(event.senderID, "money");
    const user = parseInt(event.senderID);
    const info = await api.getUserInfo(user);
    const username = info[user].name;

    const bankDataPath = 'scripts/cmds/bankData.json';

    if (!fs.existsSync(bankDataPath)) {
      const initialBankData = {};
      fs.writeFileSync(bankDataPath, JSON.stringify(initialBankData), "utf8");
    }

    const bankData = JSON.parse(fs.readFileSync(bankDataPath, "utf8"));

    if (!bankData[user]) {
      bankData[user] = { bank: 0, lastInterestClaimed: Date.now() };
      fs.writeFileSync(bankDataPath, JSON.stringify(bankData), "utf8");
    }

    bankBalance = bankData[user].bank || 0;

    const command = args[0]?.toLowerCase();
    const amount = parseInt(args[1]);
    const recipientUID = parseInt(args[2]);

    switch (command) {
      case "deposit":
        if (isNaN(amount) || amount <= 0) {
          return message.reply("[🏦 Bank 🏦]\n\n❏Please enter a valid amount to deposit.");
        }

        if (bankBalance >= 1e104) {
          return message.reply("[🏦 Bank 🏦]\n\n❏You cannot deposit money when your bank balance is already at $1e104.");
        }

        if (userMoney < amount) {
          return message.reply("[🏦 Bank 🏦]\n\n❏You don't have the required amount to deposit.");
        }

        bankData[user].bank += amount;
        await usersData.set(event.senderID, {
          money: userMoney - amount
        });
        fs.writeFileSync(bankDataPath, JSON.stringify(bankData), "utf8");

        return message.reply(`[🏦 Bank 🏦]\n\n❏Successfully deposited $${amount} into your bank account.`);
        break;

      case "withdraw":
        const balance = bankData[user].bank || 0;

        if (isNaN(amount) || amount <= 0) {
          return message.reply("[🏦 Bank 🏦]\n\n❏Please enter the correct amount to withdraw.");
        }

        if (userMoney >= 1e104) {
          return message.reply("[🏦 Bank 🏦]\n\n❏You cannot withdraw money when your balance is already at 1e104.");
        }

        if (amount > balance) {
          return message.reply("[🏦 Bank 🏦]\n\n❏The requested amount is greater than the available balance in your bank account.");
        }

        bankData[user].bank = balance - amount;
        await usersData.set(event.senderID, {
          money: userMoney + amount
        });
        fs.writeFileSync(bankDataPath, JSON.stringify(bankData), "utf8");

        return message.reply(`[🏦 Bank 🏦]\n\n❏Successfully withdrew $${amount} from your bank account.`);
        break;

      case "balance":
      case "bal":
        const formattedBankBalance = parseFloat(bankBalance);
        if (!isNaN(formattedBankBalance)) {
          return message.reply(`[🏦 Bank 🏦]\n\n❏Your bank balance is: $${formatNumberWithFullForm(formattedBankBalance)}`);
        } else {
          return message.reply("[🏦 Bank 🏦]\n\n❏Error: Your bank balance is not a valid number.");
        }
        break;

      case "interest":
      case "int":
        const interestRate = 0.001; // 0.1% daily interest rate
        const lastInterestClaimed = bankData[user].lastInterestClaimed || 0;

        const currentTime = Date.now();
        const timeDiffInSeconds = (currentTime - lastInterestClaimed) / 1000;

        if (timeDiffInSeconds < 86400) {
          // If it's been less than 24 hours since the last interest claim
          const remainingTime = Math.ceil(86400 - timeDiffInSeconds);
          const remainingHours = Math.floor(remainingTime / 3600);
          const remainingMinutes = Math.floor((remainingTime % 3600) / 60);

          return message.reply(`[🏦 Bank 🏦]\n\n❏You can claim interest again in ${remainingHours} hours and ${remainingMinutes} minutes.`);
        }

        const interestEarned = bankData[user].bank * (interestRate / 970) * timeDiffInSeconds;

        if (bankData[user].bank <= 0) {
          return message.reply("[🏦 Bank 🏦]\n\n❏You don't have any money in your bank account to earn interest.");
        }

        bankData[user].lastInterestClaimed = currentTime;
        bankData[user].bank += interestEarned;

        fs.writeFileSync(bankDataPath, JSON.stringify(bankData), "utf8");

        return message.reply(`[🏦 Bank 🏦]\n\n❏You have earned interest of $${formatNumberWithFullForm(interestEarned)}. It has been successfully added to your account balance.`);
        break;

      case "transfer":
      case "t":
        if (isNaN(amount) || amount <= 0) {
          return message.reply("[🏦 Bank 🏦]\n\n❏Please enter a valid amount to transfer.");
        }

        if (!recipientUID || !bankData[recipientUID]) {
          return message.reply("[🏦 Bank 🏦]\n\n❏Recipient not found in the bank database. Please check the recipient's ID.");
        }

        if (recipientUID === user) {
          return message.reply("[🏦 Bank 🏦]\n\n❏You cannot transfer money to yourself.");
        }

        if (bankData[user].bank < amount) {
          return message.reply("[🏦 Bank 🏦]\n\n❏You don't have enough money to transfer.");
        }

        bankData[user].bank -= amount;
        bankData[recipientUID].bank += amount;
        fs.writeFileSync(bankDataPath, JSON.stringify(bankData), "utf8");

        return message.reply(`[🏦 Bank 🏦]\n\n❏Successfully transferred $${amount} to user ${recipientUID}.`);
        break;

        case "top":
          // Sort users by bank balance and show top 15
          const topUsers = Object.keys(bankData)
              .map(userID => {
                  return { userID, bankBalance: bankData[userID].bank };
              })
              .sort((a, b) => b.bankBalance - a.bankBalance)
              .slice(0, 15); // Get top 15 users
      
          let topList = "[🏦 Bank 🏦]\n\n❏Top 15 Users with the Highest Bank Balance:\n";
      
          for (const user of topUsers) {
              const userInfo = await api.getUserInfo(user.userID);
              const userName = userInfo[user.userID]?.name || "Unknown User";
              const formattedBalance = formatNumberWithFullForm(user.bankBalance);
              topList += `${topUsers.indexOf(user) + 1}. ${userName} - $${formattedBalance}\n`;
          }
      
          return message.reply(topList);
          break;
      

      default:
        return message.reply("[🏦 Bank 🏦]\n\n❏Invalid command! Please use deposit, withdraw, balance, transfer, interest, or top.");
    }
  }
};

function formatNumberWithFullForm(num) {
  if (num >= 1e12) return (num / 1e12).toFixed(1) + "t"; // Trillion
  if (num >= 1e9) return (num / 1e9).toFixed(1) + "b"; // Billion
  if (num >= 1e6) return (num / 1e6).toFixed(1) + "m"; // Million
  if (num >= 1e3) return (num / 1e3).toFixed(1) + "k"; // Thousand
  return num.toLocaleString("en-US");
}