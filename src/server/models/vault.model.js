import { DataTypes } from "sequelize";

export function Vault(db) {
  return db.define("vault", {
    uuid: {
      type: DataTypes.UUID,
      primaryKey: true,
    },
    data: {
      type: DataTypes.TEXT,
    },
    iv: {
      type: DataTypes.STRING(256),
    },
    ownerId: {
      type: DataTypes.INTEGER,
    },
  });
}
