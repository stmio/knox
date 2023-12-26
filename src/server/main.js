import ViteExpress from "vite-express";
import app from "./app.js";

const PORT = 3000;

// ViteExpress.config({ mode: "production" });

ViteExpress.listen(app, PORT, () =>
  console.log("Server is listening on port", PORT)
);
