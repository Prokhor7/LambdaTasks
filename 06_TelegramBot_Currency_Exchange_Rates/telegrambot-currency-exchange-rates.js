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
const API = {
  WEATHER_FORECAST: `https://api.openweathermap.org/data/2.5/forecast?appid=${process.env.API_KEY}&lat=${process.env.CITY_LATITUDE}&lon=${process.env.CITY_LONGITUDE}&units=metric`,
  MONO_EXCHANGE: "https://api.monobank.ua/bank/currency",
  PRIVAT_EXCHANGE_CASH:
    "https://api.privatbank.ua/p24api/pubinfo?exchange&coursid=5",
  PRIVAT_EXCHANGE_NON_CASH:
    "https://api.privatbank.ua/p24api/pubinfo?exchange&coursid=11",
};

cron.schedule("*/25 * * * *", () => {
  axios.get(process.env.HEROKU_APP);
});

const showMainMenu = {
  message: "/start Back",
  do(msg) {
    bot.sendMessage(msg.chat.id, "Choose an option:", {
      reply_markup: {
        keyboard: [
          [`Weather forecast in ${city}`],
          ["Currency exchange rates"],
        ],
        resize_keyboard: true,
      },
    });
  },
};

const showWeatherMenu = {
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

const showCurrencyMenu = {
  message: "Currency exchange rates",
  do(msg) {
    bot.sendMessage(msg.chat.id, "Select:", {
      reply_markup: {
        keyboard: [["USD", "EUR"], ["Back"]],
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
      const response = await axios.get(API.WEATHER_FORECAST);
      bot.sendMessage(msg.chat.id, formatWeatherMessage(response.data.list));
    } catch (error) {
      console.error(
        "Error fetching or sending weather forecast: ",
        error.message
      );
    }
  },
};

const showWeatherForecast6Hour = {
  message: "With a 6-hour interval",
  async do(msg) {
    try {
      const response = await axios.get(API.WEATHER_FORECAST);
      bot.sendMessage(msg.chat.id, formatWeatherMessage(response.data.list, 6));
    } catch (error) {
      console.error(
        "Error fetching or sending weather forecast: ",
        error.message
      );
    }
  },
};

class CurrencyExchangeRates {
  mono;
  isMonoAvailable = true;

  async getDataFromMono() {
    if (this.isMonoAvailable) {
      try {
        this.mono = await axios.get(API.MONO_EXCHANGE);
        this.isMonoAvailable = false;
        setTimeout(() => {
          this.isMonoAvailable = true;
        }, 61000);
      } catch (error) {
        console.error("Error fetching data from mono", error.message);
      }
    }

    return this.mono;
  }

  async getDataFromPrivatCash() {
    try {
      return await axios.get(API.PRIVAT_EXCHANGE_CASH);
    } catch (error) {
      console.error("Error fetching data from privat", error.message);
    }
  }

  async getDataFromPrivatNonCash() {
    try {
      return await axios.get(API.PRIVAT_EXCHANGE_NON_CASH);
    } catch (error) {
      console.error("Error fetching data from privat", error.message);
    }
  }

  getExchangeRate(data, currencyCodeA, currencyCodeB) {
    const exchangeRate = data.find(
      (item) =>
        item.currencyCodeA === currencyCodeA &&
        item.currencyCodeB === currencyCodeB
    );

    return exchangeRate;
  }

  async getUSDExchangeRate() {
    const [mono, privatCash, privatNonCash] = await Promise.all([
      this.getDataFromMono(),
      this.getDataFromPrivatCash(),
      this.getDataFromPrivatNonCash(),
    ]);

    const monoUSDRate = this.getExchangeRate(mono.data, 840, 980);
    const privatCashUSDRate = privatCash.data.find(
      (exchangeRate) => exchangeRate.ccy === "USD"
    );
    const privatNonCashUSDRate = privatNonCash.data.find(
      (exchangeRate) => exchangeRate.ccy === "USD"
    );

    let USDRate = "USD:\n";

    USDRate += `\nMono:\n\t\t\tbuy: ${monoUSDRate.rateBuy}\n\t\t\tsale: ${monoUSDRate.rateSell}\n`;
    USDRate += `\nPrivat (cash):\n\t\t\tbuy: ${privatCashUSDRate.buy}\n\t\t\tsale: ${privatCashUSDRate.sale}\n`;
    USDRate += `\nPrivat (non-cash):\n\t\t\tbuy: ${privatNonCashUSDRate.buy}\n\t\t\tsale: ${privatNonCashUSDRate.sale}\n`;

    return USDRate;
  }

  async getEURExchangeRate() {
    const [mono, privatCash, privatNonCash] = await Promise.all([
      this.getDataFromMono(),
      this.getDataFromPrivatCash(),
      this.getDataFromPrivatNonCash(),
    ]);

    const monoEURRate = this.getExchangeRate(mono.data, 978, 980);
    const privatCashEURRate = privatCash.data.find(
      (exchangeRate) => exchangeRate.ccy === "EUR"
    );
    const privatNonCashEURRate = privatNonCash.data.find(
      (exchangeRate) => exchangeRate.ccy === "EUR"
    );

    let EURRate = "EUR:\n";

    EURRate += `\nMono:\n\t\t\tbuy: ${monoEURRate.rateBuy}\n\t\t\tsale: ${monoEURRate.rateSell}\n`;
    EURRate += `\nPrivat (cash):\n\t\t\tbuy: ${privatCashEURRate.buy}\n\t\t\tsale: ${privatCashEURRate.sale}\n`;
    EURRate += `\nPrivat (non-cash):\n\t\t\tbuy: ${privatNonCashEURRate.buy}\n\t\t\tsale: ${privatNonCashEURRate.sale}\n`;

    return EURRate;
  }
}

const currencyExchangeRatesService = new CurrencyExchangeRates();

const showUSDExchangeRate = {
  message: "USD",
  async do(msg) {
    try {
      bot.sendMessage(
        msg.chat.id,
        await currencyExchangeRatesService.getUSDExchangeRate()
      );
    } catch (error) {
      console.error("Error:", error.message);
    }
  },
};

const showEURExchangeRate = {
  message: "EUR",
  async do(msg) {
    try {
      bot.sendMessage(
        msg.chat.id,
        await currencyExchangeRatesService.getEURExchangeRate()
      );
    } catch (error) {
      console.error("Error:", error.message);
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
  showWeatherMenu,
  showCurrencyMenu,
  showWeatherForecast3Hour,
  showWeatherForecast6Hour,
  showUSDExchangeRate,
  showEURExchangeRate,
]);

bot.on("message", (msg) => {
  msgHandler.handle(msg);
});
