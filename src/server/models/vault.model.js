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
    ownerId: {
      type: DataTypes.INTEGER,
    },
  });
}
