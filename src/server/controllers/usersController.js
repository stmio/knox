import { db } from "../config/database.js";
import { User as UserModel } from "../models/user.model.js";
import { Keychain as KeychainModel } from "../models/keychain.model.js";

const User = UserModel(db);
const Keychain = KeychainModel(db);

export const getName = async (req, res, next) => {
  const { email } = req.body;

  const user = await User.findOne({
    where: {
      email: email,
    },
  });

  res.status(200);
  res.body = `${user.forename} ${user.surname}`;

  next();
};

export const putName = async (req, res, next) => {
  const { email, forename, surname } = req.body;

  await User.update(
    { forename: forename, surname: surname },
    { where: { email: email } }
  );

  res.status(200);
  res.body = "Successfully recorded name in database";

  next();
};

// TODO: get name

export const getUserKeychainUUIDs = async (req, res, next) => {
  const { email } = req.body;

  const user = await User.findOne({
    where: {
      email: email,
    },
  });

  const keychains = await Keychain.findAll({
    attributes: ["uuid"],
    where: { userId: user.id },
    raw: true,
  });

  res.status(200);
  res.body = JSON.stringify(keychains.map((x) => x.uuid));

  next();
};
