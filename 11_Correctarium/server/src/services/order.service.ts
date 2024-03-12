import { CreateOrderDto } from "../common/DTOs/createOrderDto";
import { OrderDto } from "../common/DTOs/orderDto";
import {
  EDITING_SPEED,
  EXTRA_FILE_FORMAT_CHARGE_FACTOR,
  EXTRA_FILE_FORMAT_TIME_FACTOR,
  MIN_EDITING_TIME_IN_HOURS,
  MIN_ORDER_COST,
  PRICE_PER_CHARACTER,
} from "../common/constants/order";
import { WORKING_SCHEDULE } from "../common/constants/working-schedule";
import { Language } from "../common/enums/language";
import { MimeType } from "../common/enums/mime-type";

class OrderService {
  public createOrder(data: CreateOrderDto): OrderDto {
    const now = new Date();
    const price = this.calculatePrice(data);
    const time = this.calculateTime(data);
    const deadline = this.calculateDeadline({
      orderPlacedAt: now,
      executionTime: time,
    });

    return {
      price: price,
      time: time,
      deadline: Math.floor(deadline.getTime() / 1000),
      deadline_date: deadline.toLocaleString("en-GB"),
    };
  }

  private calculatePrice(data: CreateOrderDto): number {
    let price = 0;
    if (data.language === Language.ENGLISH) {
      price = data.count * PRICE_PER_CHARACTER.EN;
      if (price < MIN_ORDER_COST.EN) {
        price = MIN_ORDER_COST.EN;
      }
    } else if (
      data.language === Language.RUSSIAN ||
      data.language === Language.UKRAINIAN
    ) {
      price = data.count * PRICE_PER_CHARACTER.RU_UA;
      if (price < MIN_ORDER_COST.RU_UA) {
        price = MIN_ORDER_COST.RU_UA;
      }
    }

    if (data.mimetype === MimeType.OTHER) {
      price *= EXTRA_FILE_FORMAT_CHARGE_FACTOR;
    }

    return price;
  }

  private calculateTime(data: CreateOrderDto): number {
    let time = 0;
    if (data.language === Language.ENGLISH) {
      time = data.count / EDITING_SPEED.EN;
    } else if (
      data.language === Language.RUSSIAN ||
      data.language === Language.UKRAINIAN
    ) {
      time = data.count / EDITING_SPEED.RU_UA;
    }

    if (time < MIN_EDITING_TIME_IN_HOURS) {
      time = MIN_EDITING_TIME_IN_HOURS;
    }

    if (data.mimetype === MimeType.OTHER) {
      time *= EXTRA_FILE_FORMAT_TIME_FACTOR;
    }

    return Math.round(time * 100) / 100;
  }

  private calculateDeadline({
    orderPlacedAt,
    executionTime,
  }: {
    orderPlacedAt: Date;
    executionTime: number;
  }): Date {
    let deadline = new Date(orderPlacedAt);
    while (executionTime > 0) {
      const curDayOfWeek = deadline.getDay();
      const curWorkingDay = WORKING_SCHEDULE.find(
        (day) => day.weekDay === curDayOfWeek
      );
      if (curWorkingDay) {
        const curHours = this.getHours(deadline);
        const curOpen = this.getHours(curWorkingDay.openTime);
        const curClose = this.getHours(curWorkingDay.closeTime);

        if (curHours < curOpen) {
          const curWorkHours = curClose - curOpen;

          if (executionTime < curWorkHours) {
            const hours = curOpen + executionTime;
            executionTime = 0;
            deadline.setHours(hours, (hours % 1) * 60);
          } else {
            executionTime -= curWorkHours;
            deadline.setDate(deadline.getDate() + 1);
            deadline.setHours(0, 0);
          }
        } else if (curHours < curClose) {
          const curWorkHours = curClose - curHours;

          if (executionTime < curWorkHours) {
            const hours = curHours + executionTime;
            executionTime = 0;
            deadline.setHours(hours, (hours % 1) * 60);
          } else {
            executionTime -= curWorkHours;
            deadline.setDate(deadline.getDate() + 1);
            deadline.setHours(0, 0);
          }
        } else {
          deadline.setDate(deadline.getDate() + 1);
          deadline.setHours(0, 0);
        }
      } else {
        deadline.setDate(deadline.getDate() + 1);
        deadline.setHours(0, 0);
      }
    }

    return deadline;
  }

  private getHours(time: string): number;
  private getHours(date: Date): number;
  private getHours(timeOrDate: string | Date): number {
    let time: string;
    if (timeOrDate instanceof Date) {
      time = timeOrDate.getHours().toString();
      time += ":";
      time += timeOrDate.getMinutes().toString();
    } else {
      time = timeOrDate;
    }
    const hours =
      parseFloat(time.split(":")[0]) + parseFloat(time.split(":")[1]) / 60;
    return Math.round(hours * 100) / 100;
  }
}

export const orderService = new OrderService();
