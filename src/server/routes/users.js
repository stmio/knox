import express from "express";
import { putName } from "../controllers/usersController.js";

const router = express.Router();

router.put("/name", putName);

export default router;
