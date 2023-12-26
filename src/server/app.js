import express from "express";
import morgan from "morgan";
import UsersRouter from "./routes/users.js";

const app = express();

// Log requests if not running unit tests
app.use(morgan("dev", { skip: (req, res) => process.env.NODE_ENV === "test" }));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use("/users", UsersRouter);

app.get("/hello", (req, res) => {
  res.send("Hello Vite!");
});

export default app;
