import express from "express";
import {
  putName,
  getUserKeychainUUIDs,
} from "../controllers/usersController.js";

const router = express.Router();

router.put("/name", putName);
router.post("/keychains", getUserKeychainUUIDs);

export default router;
