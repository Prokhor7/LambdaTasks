import { Language } from "../enums/language";
import { MimeType } from "../enums/mime-type";

export type CreateOrderDto = {
  language: Language;
  mimetype: MimeType;
  count: number;
};
