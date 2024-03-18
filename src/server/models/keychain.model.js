import { DataTypes } from "sequelize";

export function Keychain(db) {
  return db.define("keychain", {
    uuid: {
      type: DataTypes.UUID,
      primaryKey: true,
    },
    data: {
      type: DataTypes.TEXT,
    },
    vaultUuid: {
      type: DataTypes.UUID,
    },
    userId: {
      type: DataTypes.INTEGER,
    },
  });
}
