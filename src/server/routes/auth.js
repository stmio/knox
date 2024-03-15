import express from "express";
import { registerUser } from "../controllers/registerController.js";
import { loginUser, authenticateUser } from "../controllers/loginController.js";
import { verifyRequest } from "../middleware/verifyRequest.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/challenge", authenticateUser);

router.post("/status", verifyRequest, async (req, res) => {
  res.status(200).json({ msg: "Valid session and request signature" });
});

export default router;
