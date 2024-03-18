import { User } from "./user.model.js";
import { Vault } from "./vault.model.js";
import { Keychain } from "./keychain.model.js";

export function setupAssociations(db) {
  Vault(db).belongsToMany(User(db), { through: "keychain" });
  Vault(db).belongsTo(User(db), { foreignKey: "ownerId" });
}

export const models = { User, Vault, Keychain };
