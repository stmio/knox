const req = require("supertest");
const app = require("../app");

// TODO: Disable request logging when testing?

describe("Request router", () => {
  test("ROOT", async () => {
    const res = await req(app).get("/");
    expect(res.statusCode).toBe(200);
  });
});
