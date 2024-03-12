import { hex } from "../../utils.js";
import { db } from "../config/database.js";
import { User as UserModel } from "../models/user.model.js";

const User = UserModel(db);

export const registerUser = async (req, res) => {
  const { email, uuid, srp_v, srp_s } = req.body;
  if (!email || !uuid || !srp_v || !srp_s) {
    return res.status(400).json({ err: "Missing a required field." });
  }

  const duplicate = await User.findOne({
    where: {
      email: email,
    },
  });

  if (duplicate)
    return res
      .status(409)
      .json({ err: "An account with this email already exists" });

  try {
    await User.create({
      email: email,
      uuid: uuid,
      srp_v: hex.parseString(srp_v),
      srp_s: hex.parseString(srp_s),
    });
    res.status(201).json({ msg: `New user ${email} created!` });
  } catch (err) {
    res.status(500).json({ err: err.message });
  }
};
