const axios = require('axios');

const baseApiUrl = async () => {
  return "https://www.noobs-api.rf.gd/dipto";
};

module.exports.config = {
  name: "bby",
  aliases: ["baby", "bbe", "babe"],
  version: "6.9.0",
  author: "dipto",
  countDown: 0,
  role: 0,
  description: "better then all sim simi",
  category: "chat",
  guide: {
    en: "{pn} [anyMessage] OR\nteach [YourMessage] - [Reply1], [Reply2], [Reply3]... OR\nteach [react] [YourMessage] - [react1], [react2], [react3]... OR\nremove [YourMessage] OR\nrm [YourMessage] - [indexNumber] OR\nmsg [YourMessage] OR\nlist OR \nall OR\nedit [YourMessage] - [NeeMessage]"
  }
};

module.exports.onStart = async ({ api, event, args, usersData }) => {
  const link = `${await baseApiUrl()}/baby`;
  const dipto = args.join(" ").toLowerCase();
  const uid = event.senderID;
  let command, comd, final;

  try {
    if (!args[0]) {
      const ran = ["Bolo baby", "hum", "type help baby", "type !baby hi"];
      return api.sendMessage(ran[Math.floor(Math.random() * ran.length)], event.threadID, event.messageID);
    }

    if (args[0] === 'remove') {
      const fina = dipto.replace("remove ", "");
      const dat = (await axios.get(`${link}?remove=${fina}&senderID=${uid}`)).data.message;
      return api.sendMessage(dat, event.threadID, event.messageID);
    }

    if (args[0] === 'rm' && dipto.includes('-')) {
      const [fi, f] = dipto.replace("rm ", "").split(' - ');
      const da = (await axios.get(`${link}?remove=${fi}&index=${f}`)).data.message;
      return api.sendMessage(da, event.threadID, event.messageID);
    }

    if (args[0] === 'list') {
      if (args[1] === 'all') {
        const data = (await axios.get(`${link}?list=all`)).data;
        const teachers = await Promise.all(data.teacher.teacherList.map(async (item) => {
          const number = Object.keys(item)[0];
          const value = item[number];
          const name = (await usersData.get(number)).name;
          return { name, value };
        }));
        teachers.sort((a, b) => b.value - a.value);
        const output = teachers.map((t, i) => `${i + 1}/ ${t.name}: ${t.value}`).join('\n');
        return api.sendMessage(`Total Teach = ${data.length}\n👑 | List of Teachers of baby\n${output}`, event.threadID, event.messageID);
      } else {
        const d = (await axios.get(`${link}?list=all`)).data.length;
        return api.sendMessage(`Total Teach = ${d}`, event.threadID, event.messageID);
      }
    }

    if (args[0] === 'msg') {
      const fuk = dipto.replace("msg ", "");
      const d = (await axios.get(`${link}?list=${fuk}`)).data.data;
      return api.sendMessage(`Message ${fuk} = ${d}`, event.threadID, event.messageID);
    }

    if (args[0] === 'edit') {
      const command = dipto.split(' - ')[1];
      if (command.length < 2) return api.sendMessage('❌ | Invalid format! Use edit [YourMessage] - [NewReply]', event.threadID, event.messageID);
      const dA = (await axios.get(`${link}?edit=${args[1]}&replace=${command}&senderID=${uid}`)).data.message;
      return api.sendMessage(`changed ${dA}`, event.threadID, event.messageID);
    }

    if (args[0] === 'teach') {
      if (!dipto.includes(" - ")) return api.sendMessage('❌ | Invalid format!', event.threadID, event.messageID);
      
      [comd, command] = dipto.split(' - ');
      final = comd.replace("teach ", "");
      if (command.length < 2) return api.sendMessage('❌ | Invalid format!', event.threadID, event.messageID);
      
      const re = await axios.get(`${link}?teach=${final}&reply=${command}&senderID=${uid}`);
      const tex = re.data.message;
      const teacher = (await usersData.get(re.data.teacher)).name;
      return api.sendMessage(`✅ Replies added ${tex}\nTeacher: ${teacher}\nTeachs: ${re.data.teachs}`, event.threadID, event.messageID);
    }

    if (["amar name ki", "amr nam ki", "amar nam ki", "amr name ki", "whats my name"].some(q => dipto.includes(q))) {
      const data = (await axios.get(`${link}?text=amar name ki&senderID=${uid}&key=intro`)).data.reply;
      return api.sendMessage(data, event.threadID, event.messageID);
    }

    const d = (await axios.get(`${link}?text=${dipto}&senderID=${uid}&font=1`)).data.reply;
    const info = await api.sendMessage(d, event.threadID, event.messageID);

    if (info?.messageID) {
      global.GoatBot.onReply.set(info.messageID, {
        commandName: this.config.name,
        type: "reply",
        messageID: info.messageID,
        author: event.senderID,
        d, 
        apiUrl: link
      });
    }

  } catch (e) {
    console.log(e);
    api.sendMessage("Check console for error", event.threadID, event.messageID);
  }
};

module.exports.onReply = async ({ api, event }) => {
  try {
    if (event.type == "message_reply") {
      const a = (await axios.get(`${await baseApiUrl()}/baby?text=${encodeURIComponent(event.body?.toLowerCase())}&senderID=${event.senderID}&font=1`)).data.reply;
      const info = await api.sendMessage(a, event.threadID, event.messageID);
      
      if (info?.messageID) {
        global.GoatBot.onReply.set(info.messageID, {
          commandName: this.config.name,
          type: "reply",
          messageID: info.messageID,
          author: event.senderID,
          a
        });
      }
    }  
  } catch (err) {
    api.sendMessage(`Error: ${err.message}`, event.threadID, event.messageID);
  }
};

module.exports.onChat = async ({ api, event }) => {
  try {
    const body = event.body ? event.body.toLowerCase() : "";
    if (["baby", "bby", "janu"].some(prefix => body.startsWith(prefix))) {
      const arr = body.replace(/^\S+\s*/, "");
      const randomReplies = [
        "babu khuda lagse🥺", "Hop beda😾,Boss বল boss😼", "আমাকে ডাকলে ,আমি কিন্তূ কিস করে দেবো😘", "🐒🐒🐒",
      "bye", "naw message daw m.me/ewr.bokkor", "mb ney bye", "meww", "বলো কি বলবা, সবার সামনে বলবা নাকি?🤭🤏",
      "𝗜 𝗹𝗼𝘃𝗲 𝘆𝗼𝘂__😘😘", "𝗜 𝗵𝗮𝘁𝗲 𝘆𝗼𝘂__😏😏", "গোসল করে আসো যাও😑😩", "অ্যাসলামওয়ালিকুম", "কেমন আসো",
      "বলেন sir__😌", "বলেন ম্যাডাম__😌", "আমি অন্যের জিনিসের সাথে কথা বলি না__😏ওকে", "🙂🙂🙂", "এটায় দেখার বাকি সিলো_🙂🙂🙂",
      "𝗕𝗯𝘆 𝗯𝗼𝗹𝗹𝗮 𝗽𝗮𝗽 𝗵𝗼𝗶𝗯𝗼,,😒😒", "𝗧𝗮𝗿𝗽𝗼𝗿 𝗯𝗼𝗹𝗼_🙂", "𝗕𝗲𝘀𝗵𝗶 𝗱𝗮𝗸𝗹𝗲 𝗮𝗺𝗺𝘂 𝗯𝗼𝗸𝗮 𝗱𝗲𝗯𝗮 𝘁𝗼__🥺",
      "𝗕𝗯𝘆 না জানু, বল 😌", "বেশি bby Bbby করলে leave নিবো কিন্তু 😒😒", "__বেশি বেবি বললে কামুর দিমু 🤭🤭", 
      "𝙏𝙪𝙢𝙖𝙧 𝙜𝙛 𝙣𝙖𝙞, 𝙩𝙖𝙮 𝙖𝙢𝙠 𝙙𝙖𝙠𝙨𝙤? 😂😂😂", "bolo baby😒", "তোর কথা তোর বাড়ি কেউ শুনে না ,তো আমি কোনো শুনবো ?🤔😂",
      "আমি তো অন্ধ কিছু দেখি না🐸 😎", "আম গাছে আম নাই ঢিল কেন মারো, তোমার সাথে প্রেম নাই বেবি কেন ডাকো 😒🫣", "𝗼𝗶𝗶 ঘুমানোর আগে.! তোমার মনটা কথায় রেখে ঘুমাও.!🤔_নাহ মানে চুরি করতাম 😞😘",
      "𝗕𝗯𝘆 না বলে 𝗕𝗼𝘄 বলো 😘", "দূরে যা, তোর কোনো কাজ নাই, শুধু 𝗯𝗯𝘆 𝗯𝗯𝘆 করিস  😉😋🤣", "এই এই তোর পরীক্ষা কবে? শুধু 𝗕𝗯𝘆 𝗯𝗯𝘆 করিস 😾", 
      "তোরা যে হারে 𝗕𝗯𝘆 ডাকছিস আমি তো সত্যি বাচ্চা হয়ে যাবো_☹😑", "আজব তো__😒", "আমাকে ডেকো না,আমি ব্যাস্ত আসি🙆🏻‍♀️", "𝗕𝗯𝘆 বললে চাকরি থাকবে না", 
      "𝗕𝗯𝘆 𝗕𝗯𝘆 না করে আমার বস মানে,bokkor, bokkor ও তো করতে পারো😑?", "আমার সোনার বাংলা, তারপরে লাইন কি? 🙈", "🍺 এই নাও জুস খাও..!𝗕𝗯𝘆 বলতে বলতে হাপায় গেছো না 🥲",
      "হটাৎ আমাকে মনে পড়লো 🙄", "𝗕𝗯𝘆 বলে অসম্মান করচ্ছিছ,😰😿", "আমি তোমার সিনিয়র আপু ওকে 😼সম্মান দেও🙁", "খাওয়া দাওয়া করসো 🙄", 
      "এত কাছেও এসো না,প্রেম এ পরে যাবো তো 🙈", "আরে আমি মজা করার mood এ নাই😒", "𝗛𝗲𝘆 𝗛𝗮𝗻𝗱𝘀𝗼𝗺𝗲 বলো 😁😁", "আরে Bolo আমার জান, কেমন আসো? 😚",
      "একটা BF খুঁজে দাও 😿", "ফ্রেন্ড রিকোয়েস্ট দিলে ৫ টাকা দিবো 😗", "oi mama ar dakis na pilis 😿", "🐤🐤", "__ভালো হয়ে  যাও 😑😒",
      "এমবি কিনে দাও না_🥺🥺", "ওই মামা_আর ডাকিস না প্লিজ", "৩২ তারিখ আমার বিয়ে 🐤", "হা বলো😒,কি করতে পারি😐😑?", "বলো ফুলটুশি_😘",
      "amr JaNu lagbe,Tumi ki single aso?", "আমাকে না দেকে একটু পড়তেও বসতে তো পারো 🥺🥺", "তোর বিয়ে হয় নি 𝗕𝗯𝘆 হইলো কিভাবে,,🙄", 
      "আজ একটা ফোন নাই বলে রিপ্লাই দিতে পারলাম না_🙄", "চৌধুরী সাহেব আমি গরিব হতে পারি😾🤭 -কিন্তু বড়লোক না🥹 😫", "আমি অন্যের জিনিসের সাথে কথা বলি না__😏ওকে",
      "বলো কি বলবা, সবার সামনে বলবা নাকি?🤭🤏", "ভুলে জাও আমাকে 😞😞", "দেখা হলে কাঠগোলাপ দিও..🤗", "শুনবো না😼 তুমি আমাকে প্রেম করাই দাও নি🥺 পচা তুমি🥺",
      "আগে একটা গান বলো, ☹ নাহলে কথা বলবো না 🥺", "বলো কি করতে পারি তোমার জন্য 😚", "কথা দেও আমাকে পটাবা...!! 😌", 
      "বার বার Disturb করেছিস কোনো 😾, আমার জানু এর সাথে ব্যাস্ত আসি 😋", "আমাকে না দেকে একটু পড়তে বসতেও তো পারো 🥺🥺", 
      "বার বার ডাকলে মাথা গরম হয় কিন্তু 😑😒", "ওই তুমি single না?🫵🤨 😑😒", "বলো জানু 😒", "Meow🐤", "আর কত বার ডাকবা ,শুনছি তো 🤷🏻‍♀️", 
      "কি হলো, মিস টিস করচ্ছো নাকি 🤣", "Bolo Babu, তুমি কি আমাকে ভালোবাসো? 🙈", "আজকে আমার মন ভালো নেই 🙉"
      ];
      const reply = arr ? (await axios.get(`${await baseApiUrl()}/baby?text=${encodeURIComponent(arr)}&senderID=${event.senderID}&font=1`)).data.reply : randomReplies[Math.floor(Math.random() * randomReplies.length)];
      const info = await api.sendMessage(reply, event.threadID, event.messageID);

      if (info?.messageID) {
        global.GoatBot.onReply.set(info.messageID, {
          commandName: this.config.name,
          type: "reply",
          messageID: info.messageID,
          author: event.senderID,
          reply
        });
      }
    }
  } catch (err) {
    api.sendMessage(`Error: ${err.message}`, event.threadID, event.messageID);
  }
};