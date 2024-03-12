import { WeekDay } from "../enums/week-day";
import { WorkingDay } from "../models/working-day";

export const WORKING_SCHEDULE: WorkingDay[] = [
  { weekDay: WeekDay.MONDAY, openTime: "10:00", closeTime: "19:00" },
  { weekDay: WeekDay.TUESDAY, openTime: "10:00", closeTime: "19:00" },
  { weekDay: WeekDay.WEDNESDAY, openTime: "10:00", closeTime: "19:00" },
  { weekDay: WeekDay.THURSDAY, openTime: "10:00", closeTime: "19:00" },
  { weekDay: WeekDay.FRIDAY, openTime: "10:00", closeTime: "19:00" },
];
