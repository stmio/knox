import { db } from "../config/database.js";
import { User as UserModel } from "../models/user.model.js";

const User = UserModel(db);

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
