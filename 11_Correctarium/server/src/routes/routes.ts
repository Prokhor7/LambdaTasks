import express from "express";
import { API } from "../common/enums/api";
import { orderController } from "../controllers/order.controller";

const router = express.Router();

router.get(API.HEALTH, (_req, res) => res.send("OK"));
router.use(API.ORDERS, orderController);

export { router };
