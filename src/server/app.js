import express from "express";
import morgan from "morgan";

import AuthRouter from "./routes/auth.js";
import UsersRouter from "./routes/users.js";
import KeychainsRouter from "./routes/keychains.js";
import VaultsRouter from "./routes/vaults.js";

const app = express();

import { verifyRequest } from "./middleware/verifyRequest.js";
import { signResponse } from "./middleware/signResponse.js";
import { decryptRequest } from "./middleware/decryptRequest.js";
const sendResponse = (req, res) => res.json(res.body);

// Log requests if not running unit tests
app.use(morgan("dev", { skip: (req, res) => process.env.NODE_ENV === "test" }));

// Enable JSON parsing
app.use(express.json({ limit: "200kb" }));
app.use(express.urlencoded({ extended: false }));

// Public API routes
app.use("/auth", AuthRouter);

// Protected API routes
app.use(
  "/users",
  decryptRequest,
  verifyRequest,
  UsersRouter,
  signResponse,
  sendResponse
);

app.use(
  "/keychains",
  decryptRequest,
  verifyRequest,
  KeychainsRouter,
  signResponse,
  sendResponse
);

app.use(
  "/vaults",
  decryptRequest,
  verifyRequest,
  VaultsRouter,
  signResponse,
  sendResponse
);

export default app;
