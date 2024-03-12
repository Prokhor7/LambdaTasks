import dotenv from "dotenv";

dotenv.config();

const MIN_ORDER_COST = {
  RU_UA: parseFloat(process.env.MIN_ORDER_COST_RU_UA!),
  EN: parseFloat(process.env.MIN_ORDER_COST_EN!),
} as const;

const PRICE_PER_CHARACTER = {
  RU_UA: parseFloat(process.env.PRICE_PER_CHARACTER_RU_UA!),
  EN: parseFloat(process.env.PRICE_PER_CHARACTER_EN!),
} as const;

const EDITING_SPEED = {
  RU_UA: parseFloat(process.env.EDITING_SPEED_RU_UA!),
  EN: parseFloat(process.env.EDITING_SPEED_EN!),
} as const;

const MIN_EDITING_TIME_IN_HOURS = parseFloat(
  process.env.MIN_EDITING_TIME_IN_HOURS!
);

const EXTRA_FILE_FORMAT_CHARGE_FACTOR = parseFloat(
  process.env.EXTRA_FILE_FORMAT_CHARGE_FACTOR!
);

const EXTRA_FILE_FORMAT_TIME_FACTOR = parseFloat(
  process.env.EXTRA_FILE_FORMAT_TIME_FACTOR!
);

if (
  !MIN_ORDER_COST.RU_UA ||
  !MIN_ORDER_COST.EN ||
  !PRICE_PER_CHARACTER.RU_UA ||
  !PRICE_PER_CHARACTER.EN ||
  !EDITING_SPEED.RU_UA ||
  !EDITING_SPEED.EN ||
  !MIN_EDITING_TIME_IN_HOURS ||
  !EXTRA_FILE_FORMAT_CHARGE_FACTOR ||
  !EXTRA_FILE_FORMAT_TIME_FACTOR
) {
  throw new Error("Required environment variables are missing");
}

export {
  MIN_ORDER_COST,
  PRICE_PER_CHARACTER,
  EDITING_SPEED,
  MIN_EDITING_TIME_IN_HOURS,
  EXTRA_FILE_FORMAT_CHARGE_FACTOR,
  EXTRA_FILE_FORMAT_TIME_FACTOR,
};
