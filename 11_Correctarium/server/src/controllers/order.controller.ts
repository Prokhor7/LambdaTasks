import express from "express";
import { orderService } from "../services/order.service";
import { validateCreateOrderDto } from "../middlewares/validate-order";

const orderController = express.Router();

orderController.post("/", validateCreateOrderDto, (req, res) => {
  try {
    const order = orderService.createOrder(req.body);
    res.json(order);
  } catch (error) {
    console.error("Error creating order:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

export { orderController };
