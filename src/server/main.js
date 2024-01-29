import ViteExpress from "vite-express";
import app from "./app.js";
import { initDatabase } from "./config/database.js";

const PORT = 3000;

ViteExpress.listen(app, PORT, () => {
  console.log("Server is listening on port", PORT);
  initDatabase();
});
