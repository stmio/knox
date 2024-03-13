import { DataTypes } from "sequelize";

export function User(db) {
  return db.define("user", {
    id: {
      // Modified in accountID.sql
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    email: {
      type: DataTypes.STRING,
    },
    uuid: {
      type: DataTypes.UUID,
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
    enc_salt: {
      type: DataTypes.STRING(4096),
    },
  });
}
