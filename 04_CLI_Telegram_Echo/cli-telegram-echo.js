require("dotenv").config();
const axios = require("axios");
const TelegramBot = require("node-telegram-bot-api");

const token = process.env.TG_BOT_TOKEN;

const bot = new TelegramBot(token, { polling: true });

bot.on("message", async (msg) => {
  const chatId = msg.chat.id;
  const messageText = msg.text;
  let username = msg.from.first_name;
  if (msg.from.last_name) {
    username += " " + msg.from.last_name;
  }

  if (messageText.toLowerCase() === "photo") {
    console.log(`User ${username} requested an image`);

    try {
      const response = await axios.get("https://picsum.photos/200/300", {
        responseType: "arraybuffer",
      });

      bot.sendPhoto(chatId, Buffer.from(response.data));
    } catch (error) {
      console.error("Error fetching or sending photo:", error.message);
    }
  } else {
    console.log(`Received message: "${messageText}" from ${username}`);
    bot.sendMessage(chatId, `Your message: "${messageText}"`);
  }
});

bot.on("polling_error", (error) => {
  console.error("Polling error:", error);
});

console.log("Bot is running...");
