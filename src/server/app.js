import express from "express";
import morgan from "morgan";
import UsersRouter from "./routes/users.js";
import AuthRouter from "./routes/auth.js";

const app = express();

// Log requests if not running unit tests
app.use(morgan("dev", { skip: (req, res) => process.env.NODE_ENV === "test" }));

// Enable JSON parsing
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// API routes
app.use("/users", UsersRouter);
app.use("/auth", AuthRouter);

export default app;
