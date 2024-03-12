import request from "supertest";
import { app, server } from "../index";
import { API } from "../common/enums/api";

describe("Test orderController", () => {
  it("Should respond with JSON containing order details on valid input", async () => {
    const validOrderData = {
      language: "en",
      mimetype: "doc",
      count: 10000,
    };

    const response = await request(app)
      .post(API.ORDERS)
      .send(validOrderData)
      .expect(200);

    expect(response.body).toHaveProperty("price");
    expect(response.body).toHaveProperty("time");
    expect(response.body).toHaveProperty("deadline");
    expect(response.body).toHaveProperty("deadline_date");
  });

  it("Should respond with a 400 status and error message on invalid input", async () => {
    const invalidOrderData = {
      language: "invalid-language",
      mimetype: "invalid-mimetype",
      count: -1, // Invalid count
    };

    const response = await request(app)
      .post(API.ORDERS)
      .send(invalidOrderData)
      .expect(400);

    expect(response.body).toHaveProperty("error");
  });

  afterAll(async () => {
    await server.close();
  });
});
