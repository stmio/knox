import express from "express";
import { registerUser } from "../controllers/registerController.js";
import { loginUser, authenticateUser } from "../controllers/loginController.js";
import { verifyRequest } from "../middleware/verifyRequest.js";
import { signResponse } from "../middleware/signResponse.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/challenge", authenticateUser);

router.post(
  "/status",
  verifyRequest,
  async (req, res, next) => {
    res.body = { msg: "Valid session and request signature" };
    res.status(200);
    next();
  },
  signResponse,
  (req, res) => res.json(res.body)
);

export default router;
