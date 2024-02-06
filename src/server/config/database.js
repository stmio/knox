import { Sequelize } from "sequelize";
import { models } from "../models/index.js";

export const db = new Sequelize("knox", "postgres", "applepiepancakes", {
  host: "localhost",
  dialect: "postgres",
  logging: false,
});

export async function initDatabase() {
  try {
    await db.authenticate();
    console.log("Connection to the database has been established");
  } catch (error) {
    console.error("Unable to connect to the database:", error);
  }

  // Load models
  Object.values(models).forEach((model) => model(db));

  try {
    await db.sync();
    console.log("Successfully synced with the database");
  } catch (error) {
    console.error("Unable to sync with the database:", error);
  }
}
