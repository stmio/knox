import { randomBytes, hkdfSync as hkdf } from "crypto";
import { hex } from "../../utils.js";
import { core, server } from "../../srp/srp.js";
import { db } from "../config/database.js";
import { redis } from "../config/redis.js";
import { User as UserModel } from "../models/user.model.js";

const User = UserModel(db);

export const loginUser = async (req, res) => {
  const { identity, A } = req.body;
  if (!identity || !A) {
    return res.status(400).json({ err: "Missing a required field." });
  }

  const user = await User.findOne({
    where: {
      email: identity,
    },
  });

  if (!user)
    return res.status(401).json({ err: "No account with this email address." });

  const { v, s } = { v: hex.toBigInt(user.srp_v), s: hex.toBigInt(user.srp_s) };
  const b = core.get_private_ephemeral_key();
  const B = server.derive_B(b, v, core.derive_k());

  // TODO: check device id unique
  const deviceID = hex.toString(randomBytes(4));
  const cacheID = `${identity}:${deviceID}`;

  await redis.hSet(cacheID, {
    A: A,
    b: hex.toString(b),
    authenticated: 0,
  });
  await redis.expire(cacheID, 10);

  res.status(200).json({
    B: hex.toString(B),
    s: hex.toString(s),
    device: deviceID,
    userID: user.id,
    uuid: user.uuid,
  });
};

export const authenticateUser = async (req, res) => {
  const { identity, deviceID } = req.body;
  if (!identity || !deviceID || !req.body.challenge) {
    return res.status(400).json({ err: "Missing a required field." });
  }

  const M1 = hex.toBigInt(req.body.challenge);

  const cacheID = `${identity}:${deviceID}`;
  const user = await User.findOne({
    where: {
      email: identity,
    },
  });

  if (!user)
    return res.status(401).json({ err: "No account with this email address." });

  const { v, s } = { v: hex.toBigInt(user.srp_v), s: hex.toBigInt(user.srp_s) };

  const cache = await redis.hGetAll(cacheID);
  if (!cache) res.status(401).json({ err: "Authentication was unsuccessful." });

  const B = server.derive_B(hex.toBigInt(cache.b), v, core.derive_k());
  const u = core.derive_u(hex.toBigInt(cache.A), B);
  const K = server.derive_K(v, hex.toBigInt(cache.A), hex.toBigInt(cache.b), u);

  if (server.verify_M1(M1, identity, s, hex.toBigInt(cache.A), B, K)) {
    const M2 = server.derive_M2(hex.toBigInt(cache.A), M1, K);

    const e2e_salt = randomBytes(512 / 8);
    const sign_salt = randomBytes(512 / 8);

    const { SEK, SAK } = {
      SEK: Buffer.from(hkdf("sha512", hex.toBuffer(K), e2e_salt, "enc", 32)),
      SAK: Buffer.from(hkdf("sha512", hex.toBuffer(K), sign_salt, "auth", 64)),
    };

    await redis.hSet(cacheID, {
      K: hex.toString(K),
      SEK: hex.toString(SEK),
      SAK: hex.toString(SAK),
      authenticated: 1,
    });
    await redis.expire(cacheID, 900); // 15min session

    res.status(200).json({
      challenge: hex.toString(M2),
      enc_salt: user.enc_salt,
      e2e_salt: hex.toString(e2e_salt),
      sign_salt: hex.toString(sign_salt),
    });
  } else {
    await redis.del(cacheID);
    res.status(401).json({ err: "Authentication was unsuccessful." });
  }
};
