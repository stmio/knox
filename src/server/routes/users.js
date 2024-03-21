import express from "express";
import {
  putName,
  getName,
  getUserKeychainUUIDs,
} from "../controllers/usersController.js";

const router = express.Router();

router.put("/name", putName);
router.post("/name", getName);
router.post("/keychains", getUserKeychainUUIDs);

export default router;
