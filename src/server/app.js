import express from "express";
import morgan from "morgan";

const app = express();

// Routers
import AuthRouter from "./routes/auth.js";
import UsersRouter from "./routes/users.js";
import KeychainsRouter from "./routes/keychains.js";
import VaultsRouter from "./routes/vaults.js";

// Middleware
import { verifyRequest } from "./middleware/verifyRequest.js";
import { signResponse } from "./middleware/signResponse.js";
import { decryptRequest } from "./middleware/decryptRequest.js";
import { encryptResponse } from "./middleware/encryptResponse.js";
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
  verifyRequest,
  decryptRequest,
  UsersRouter,
  encryptResponse,
  signResponse,
  sendResponse
);

app.use(
  "/keychains",
  verifyRequest,
  decryptRequest,
  KeychainsRouter,
  encryptResponse,
  signResponse,
  sendResponse
);

app.use(
  "/vaults",
  verifyRequest,
  decryptRequest,
  VaultsRouter,
  encryptResponse,
  signResponse,
  sendResponse
);

export default app;
