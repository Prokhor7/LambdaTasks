require("dotenv").config();
const axios = require("axios");
const cron = require("node-cron");
const express = require("express");
const TelegramBot = require("node-telegram-bot-api");

const token = process.env.TG_BOT_TOKEN;

const bot = new TelegramBot(token, { polling: true });

const app = express();
const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.send("Bot is up and running!");
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

const city = process.env.CITY;
const API = `https://api.openweathermap.org/data/2.5/forecast?appid=${process.env.API_KEY}&lat=${process.env.CITY_LATITUDE}&lon=${process.env.CITY_LONGITUDE}&units=metric`;

cron.schedule("*/25 * * * *", () => {
  axios.get(process.env.HEROKU_APP);
});

const showMainMenu = {
  message: "/start Back",
  do(msg) {
    bot.sendMessage(msg.chat.id, "Choose an option:", {
      reply_markup: {
        keyboard: [[`Weather forecast in ${city}`]],
        resize_keyboard: true,
      },
    });
  },
};

const showSubMenu = {
  message: `Weather forecast in ${city}`,
  do(msg) {
    bot.sendMessage(msg.chat.id, "Select the interval", {
      reply_markup: {
        keyboard: [
          ["With a 3-hour interval", "With a 6-hour interval"],
          ["Back"],
        ],
        resize_keyboard: true,
      },
    });
  },
};

function formatWeatherMessage(data, interval = 3) {
  const weekdayOption = { weekday: "long" };
  const dayAndMonthOption = { month: "long", day: "numeric" };
  const timeOptions = { hour: "numeric", minute: "numeric", hour12: false };

  let formattedMessage = `Weather forecast in ${city}:\n`;

  const groupedData = data.reduce((result, entry, index) => {
    if (index % (interval / 3) === 0) {
      const date = new Date(entry.dt_txt);
      const dateString =
        date.toLocaleDateString("en-GB", weekdayOption) +
        ", " +
        date.toLocaleDateString("en-GB", dayAndMonthOption);

      result[dateString] = result[dateString] || [];
      result[dateString].push(entry);
    }

    return result;
  }, {});

  for (const [date, entries] of Object.entries(groupedData)) {
    formattedMessage += `\n${date}:\n`;

    for (const entry of entries) {
      const time = new Date(entry.dt_txt).toLocaleTimeString(
        "en-GB",
        timeOptions
      );
      const temperature = entry.main.temp.toFixed(1);
      const feelsLike = entry.main.feels_like.toFixed(1);
      const description = entry.weather[0].description;

      formattedMessage += `\t\t\t${time}, ${
        temperature > 0
          ? `+${Math.round(temperature)}`
          : Math.round(temperature)
      }°C, feels like: ${
        feelsLike > 0 ? `+${Math.round(feelsLike)}` : Math.round(feelsLike)
      }°C, ${description}\n`;
    }
  }

  return formattedMessage;
}

const showWeatherForecast3Hour = {
  message: "With a 3-hour interval",
  async do(msg) {
    try {
      const response = await axios.get(API);
      bot.sendMessage(msg.chat.id, formatWeatherMessage(response.data.list));
    } catch (error) {
      console.error(
        "Error fetching or sending weather forecast:",
        error.message
      );
    }
  },
};

const showWeatherForecast6Hour = {
  message: "With a 6-hour interval",
  async do(msg) {
    try {
      const response = await axios.get(API);
      bot.sendMessage(msg.chat.id, formatWeatherMessage(response.data.list, 6));
    } catch (error) {
      console.error(
        "Error fetching or sending weather forecast:",
        error.message
      );
    }
  },
};

class Handler {
  actions = [];

  constructor(actions) {
    this.actions.push(...actions);
  }

  handle(msg) {
    this.actions.find((action) => action.message.includes(msg.text))?.do(msg);
  }
}

const msgHandler = new Handler([
  showMainMenu,
  showSubMenu,
  showWeatherForecast3Hour,
  showWeatherForecast6Hour,
]);

bot.on("message", (msg) => {
  msgHandler.handle(msg);
});
