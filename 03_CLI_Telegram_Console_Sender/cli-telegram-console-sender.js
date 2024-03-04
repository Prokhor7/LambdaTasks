require("dotenv").config();
const { program } = require("commander");
const TelegramBot = require("node-telegram-bot-api");
const fs = require("fs");

const token = process.env.TG_BOT_TOKEN;
const chatId = process.env.CHAT_ID;
const bot = new TelegramBot(token, { polling: false });

program
  .name("tg-util")
  .description("CLI to send some data to tg bot")
  .version("1.0.0");

const sendMessage = (text) => {
  bot
    .sendMessage(chatId, text)
    .then(() => {
      console.log("Message sent successfully!");
    })
    .catch((error) => {
      console.error("Error sending message:", error.message);
    });
};

const sendPhoto = (path) => {
  const photo = {
    photo: fs.createReadStream(path),
  };

  bot
    .sendPhoto(chatId, photo.photo, { caption: photo.caption })
    .then(() => {
      console.log("Photo sent successfully!");
    })
    .catch((error) => {
      console.error("Error sending photo:", error.message);
    });
};

program
  .command("message <text>")
  .alias("m")
  .description("Send a message to the Telegram bot")
  .action((text) => sendMessage(text));

program
  .command("photo <path>")
  .alias("p")
  .description("Send a photo to the Telegram bot")
  .action((path) => sendPhoto(path));

program.parse();
