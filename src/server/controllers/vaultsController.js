import { db } from "../config/database.js";
import { Vault as VaultModel } from "../models/vault.model.js";
import { User as UserModel } from "../models/user.model.js";

const Vault = VaultModel(db);
const User = UserModel(db);

// TODO: edge cases?

export const getVault = async (req, res, next) => {
  const { vaultUuid, email } = req.body;

  const vault = await Vault.findOne({
    where: {
      uuid: vaultUuid,
    },
  });

  if (!vault) {
    return res.status(400).json({ err: "No vault with this UUID." });
  }

  const owner = await User.findOne({
    where: {
      id: vault.ownerId,
    },
  });

  if (owner.email !== email) {
    return res
      .status(403)
      .json({ err: "You do not have permission to access this vault" });
  }

  res.status(200);
  res.body = JSON.stringify({
    data: vault.data,
    iv: vault.iv,
    uuid: vault.uuid,
  });

  next();
};

export const storeVault = async (req, res, next) => {
  const { vaultUuid, data, iv, email } = req.body;

  const owner = await User.findOne({
    where: {
      email: email,
    },
  });

  await Vault.create({
    uuid: vaultUuid,
    data: data,
    iv: iv,
    ownerId: owner.id,
  });

  res.status(201);
  res.body = "Vault stored in database";

  next();
};

export const updateVault = async (req, res, next) => {
  const { data, iv, vaultUuid, email } = req.body;

  const vault = await Vault.findOne({
    where: {
      uuid: vaultUuid,
    },
  });

  if (!vault) {
    return res.status(400).json({ err: "No vault with this UUID." });
  }

  const owner = await User.findOne({
    where: {
      id: vault.ownerId,
    },
  });

  if (owner.email !== email) {
    return res
      .status(403)
      .json({ err: "You do not have permission to access this vault" });
  }

  await Vault.update({ data: data, iv: iv }, { where: { uuid: vaultUuid } });

  res.status(200);
  res.body = "Vault updated in database";

  next();
};
