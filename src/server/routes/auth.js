import express from "express";
const router = express.Router();

router.get("/register", function (req, res, next) {
  res.send("hello");
});

export default router;
