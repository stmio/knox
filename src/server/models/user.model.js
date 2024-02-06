import { DataTypes } from "sequelize";

export function User(db) {
  return db.define("User", {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    email: {
      type: DataTypes.STRING,
    },
    forename: {
      type: DataTypes.STRING,
    },
    surname: {
      type: DataTypes.STRING,
    },
    srp_v: {
      type: DataTypes.STRING(4096),
    },
    srp_s: {
      type: DataTypes.STRING(4096),
    },
  });
}
