import express from "express";
import { putName } from "../controllers/usersController.js";

const router = express.Router();

/* GET users listing. */
router.put("/name", putName);

export default router;
