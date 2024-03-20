import { db } from "../config/database.js";
import { Keychain as KeychainModel } from "../models/keychain.model.js";
import { User as UserModel } from "../models/user.model.js";

const Keychain = KeychainModel(db);
const User = UserModel(db);

// TODO: edge cases?

export const getKeychain = async (req, res, next) => {
  const { keychainUuid, email } = req.body;

  const keychain = await Keychain.findOne({
    where: {
      uuid: keychainUuid,
    },
  });

  if (!keychain) {
    return res.status(400).json({ err: "No keychain with this UUID." });
  }

  const owner = await User.findOne({
    where: {
      id: keychain.userId,
    },
  });

  if (owner.email !== email) {
    return res
      .status(403)
      .json({ err: "You do not have permission to access this keychain" });
  }

  res.status(200);
  res.body = JSON.stringify({
    keys: keychain.data,
    vault: keychain.vaultUuid,
  });

  next();
};

export const storeKeychain = async (req, res, next) => {
  const { keychainUuid, vaultUuid, data, email } = req.body;

  const owner = await User.findOne({
    where: {
      email: email,
    },
  });

  await Keychain.create({
    uuid: keychainUuid,
    data: data,
    vaultUuid: vaultUuid,
    userId: owner.id,
  });

  res.status(201);
  res.body = "Keychain stored in database";

  next();
};
