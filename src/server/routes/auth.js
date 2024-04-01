import express from "express";
import { registerUser } from "../controllers/registerController.js";
import { loginUser, authenticateUser } from "../controllers/loginController.js";
import { verifyRequest } from "../middleware/verifyRequest.js";
import { signResponse } from "../middleware/signResponse.js";
import { decryptRequest } from "../middleware/decryptRequest.js";
import { encryptResponse } from "../middleware/encryptResponse.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/challenge", authenticateUser);

router.post(
  "/status",
  verifyRequest,
  decryptRequest,
  async (req, res, next) => {
    res.body = { msg: "Valid session and request signature" };
    res.status(200);
    next();
  },
  encryptResponse,
  signResponse,
  (req, res) => res.json(res.body)
);

export default router;
