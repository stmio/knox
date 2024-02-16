import express from "express";
import { registerUser } from "../controllers/registerController.js";
import { loginUser, authenticateUser } from "../controllers/loginController.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/challenge", authenticateUser);
router.get("/me");

export default router;
