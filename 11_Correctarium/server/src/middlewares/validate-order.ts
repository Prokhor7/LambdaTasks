import { Request, Response, NextFunction } from "express";
import Joi from "joi";
import { Language } from "../common/enums/language";
import { MimeType } from "../common/enums/mime-type";

const createOrderSchema = Joi.object({
  language: Joi.string()
    .valid(...Object.values(Language))
    .required(),
  mimetype: Joi.string()
    .valid(...Object.values(MimeType))
    .required(),
  count: Joi.number().positive().required(),
});

export const validateCreateOrderDto = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { error } = createOrderSchema.validate(req.body);

  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }

  next();
};
