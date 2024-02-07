import ViteExpress from "vite-express";
import app from "./app.js";
import { initDatabase } from "./config/database.js";
import { startRedis } from "./config/redis.js";

const PORT = 3000;

ViteExpress.listen(app, PORT, async () => {
  await initDatabase();
  await startRedis();
  console.log("Server is listening on port", PORT);
});
