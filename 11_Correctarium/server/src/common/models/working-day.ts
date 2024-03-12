import { WeekDay } from "../enums/week-day";

export type WorkingDay = {
  weekDay: WeekDay;
  openTime: string;
  closeTime: string;
};
