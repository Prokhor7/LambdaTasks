import { CreateOrderDto } from "../common/DTOs/createOrderDto";
import {
  MIN_ORDER_COST,
  EXTRA_FILE_FORMAT_CHARGE_FACTOR,
  PRICE_PER_CHARACTER,
  MIN_EDITING_TIME_IN_HOURS,
  EDITING_SPEED,
  EXTRA_FILE_FORMAT_TIME_FACTOR,
} from "../common/constants/order";
import { Language } from "../common/enums/language";
import { MimeType } from "../common/enums/mime-type";
import { orderService } from "../services/order.service";

describe("Test orderService", () => {
  it("Should return min price for order in EN", () => {
    const data: CreateOrderDto = {
      language: Language.ENGLISH,
      mimetype: MimeType.DOC,
      count: 100,
    };
    const price = orderService["calculatePrice"](data);
    expect(price).toEqual(MIN_ORDER_COST.EN);
  });

  it("Should return min price for order in UA, multiplied by extra file format charge factor", () => {
    const data: CreateOrderDto = {
      language: Language.UKRAINIAN,
      mimetype: MimeType.OTHER,
      count: 100,
    };
    const price = orderService["calculatePrice"](data);
    expect(price).toEqual(
      MIN_ORDER_COST.RU_UA * EXTRA_FILE_FORMAT_CHARGE_FACTOR
    );
  });

  it("Should return appropriate price for order in RU", () => {
    const data: CreateOrderDto = {
      language: Language.RUSSIAN,
      mimetype: MimeType.DOCX,
      count: 10000,
    };
    const price = orderService["calculatePrice"](data);
    expect(price).toEqual(data.count * PRICE_PER_CHARACTER.RU_UA);
  });

  it("Should return min execution time for order", () => {
    const data: CreateOrderDto = {
      language: Language.UKRAINIAN,
      mimetype: MimeType.DOC,
      count: 100,
    };
    const time = orderService["calculateTime"](data);
    expect(time).toEqual(MIN_EDITING_TIME_IN_HOURS);
  });

  it("Should return appropriate execution time for order, multiplied by extra file format time factor", () => {
    const data: CreateOrderDto = {
      language: Language.ENGLISH,
      mimetype: MimeType.OTHER,
      count: 999,
    };
    const time = orderService["calculateTime"](data);
    expect(time).toBeCloseTo(
      (data.count / EDITING_SPEED.EN) * EXTRA_FILE_FORMAT_TIME_FACTOR
    );
  });

  it("Should return appropriate order details", () => {
    const data: CreateOrderDto = {
      language: Language.RUSSIAN,
      mimetype: MimeType.DOC,
      count: 10_000,
    };
    const order = orderService.createOrder(data);
    expect(order.price).toEqual(data.count * PRICE_PER_CHARACTER.RU_UA);
    expect(order.time).toBeCloseTo(data.count / EDITING_SPEED.RU_UA);
  });
});
