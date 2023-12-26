import { describe, expect, test } from "vitest";
import { agent as req } from "supertest";
import app from "../src/server/app";

describe("Request router", () => {
  test("users", async () => {
    const res = await req(app).get("/users");
    expect(res.statusCode).toBe(200);
  });

  test("not found", async () => {
    const res = await req(app).get("/foo");
    expect(res.statusCode).toBe(404);
  });
});
