import { DataTypes } from "sequelize";

export function User(db) {
  return db.define("User", {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    forename: {
      type: DataTypes.STRING,
    },
    surname: {
      type: DataTypes.STRING,
    },
  });
}
