import { sign, verify } from "jsonwebtoken";
import { db } from "../lib/db";

export const newToken = (user) => {
  return sign({ id: user.id }, process.env.SECRET, {
    expiresIn: "365d"
  });
};

export const verifyToken = (token) =>
  new Promise((resolve, reject) => {
    verify(token, process.env.SECRET, (err, payload) => {
      if (err) return reject(err);
      resolve(payload);
    });
  });

export const signup = async (req, res) => {
  const { email, password, confirm_password } = req.body;

  if (!email || !password) {
    return res.status(400).send({ message: "need email and password" });
  }

  if (password !== confirm_password) {
    return res.status(400).send({ message: "Password don't match" });
  }
  try {
    const user = await db.user.create(req.body);
    const token = newToken(user);
    return res.status(201).send({ user: { email, username }, token });
  } catch (e) {
    console.log(e);
    return res.status(500).end();
  }
};

export const signin = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).send({ message: "need email and password" });
  }

  const invalid = { message: "Invalid email and password combination" };

  try {
    const user = await db.user
      .findOne({ email })
      .select("username email password")
      .exec();

    if (!user) {
      return res.status(401).send(invalid);
    }

    const match = await user.checkPassword(password);

    if (!match) {
      return res.status(401).send(invalid);
    }

    const token = newToken(user);

    return res
      .status(201)
      .send({ user: { username: user.username, email: user.email }, token });
  } catch (e) {
    console.error(e);
    res.status(500).end();
  }
};

export const protect = async (req, res, next) => {
  const bearer = req.headers.authorization;

  if (!bearer || !bearer.startsWith("Bearer ")) {
    return res.status(401).end();
  }

  const token = bearer.split("Bearer ")[1].trim();
  let payload;
  try {
    payload = await verifyToken(token);
  } catch (e) {
    return res.status(401).end();
  }

  const user = await db.user
    .findById(payload.id)
    .select("-password")
    .lean()
    .exec();

  if (!user) {
    return res.status(401).end();
  }

  req.user = user;
  next();
};
