const { sign, verify } = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const { db } = require("../lib/db");

const saltRounds = 10;

const newToken = (user) => {
  return sign({ id: user.id }, process.env.SECRET, {
    expiresIn: "365d"
  });
};

const verifyToken = (token) =>
  new Promise((resolve, reject) => {
    verify(token, process.env.SECRET, (err, payload) => {
      if (err) return reject(err);
      resolve(payload);
    });
  });

const signup = async (req, res) => {
  try {
    const { email, password, confirm_password } = req.body;
    if (!email || !password) {
      return res.status(400).send({ message: "need email and password" });
    }

    if (password !== confirm_password) {
      return res.status(400).send({ message: "Password don't match" });
    }
    let hashedPassword;
    await bcrypt.hash(password, saltRounds).then(function (hash) {
      hashedPassword = hash;
    });

    const newUser = await db.user.create({
      data: {
        email,
        password: hashedPassword
      },
      select: {
        id: true,
        email: true,
        first_name: true,
        last_name: true,
        title: true,
        caption: true
      }
    });
    const token = newToken(newUser);
    return res.status(201).send({ user: newUser, token });
  } catch (e) {
    console.log(e);
    return res.status(500).send({ message: "Server Error" }).end();
  }
};

const signin = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).send({ message: "Need email and password" });
    }

    const existingUser = await db.user.findUnique({
      where: {
        email
      }
    });

    if (!existingUser) {
      return res.status(401).send({ message: "User does not exist" });
    }

    const match = await bcrypt.compare(password, existingUser.password);

    if (!match) {
      return res.status(401).send({ message: "Wrong password" });
    }

    const token = newToken(existingUser);

    return res.status(200).send({
      user: {
        id: existingUser.id,
        email: existingUser.email,
        first_name: existingUser.first_name,
        last_name: existingUser.last_name,
        title: existingUser.title,
        caption: existingUser.caption
      },
      token
    });
  } catch (e) {
    console.error(e);
    res.status(500).send({ message: "Server Error" }).end();
  }
};

const protect = async (req, res, next) => {
  try {
    const bearer = req.headers.authorization;

    if (!bearer || !bearer.startsWith("Bearer ")) {
      return res.status(401).end();
    }

    const token = bearer.split("Bearer ")[1].trim();

    const payload = await verifyToken(token);

    const user = await db.user.findUnique({
      where: {
        id: payload.id
      },
      select: {
        id: true,
        email: true,
        first_name: true,
        last_name: true,
        title: true,
        caption: true
      }
    });

    if (!user) {
      return res.status(401).send({ message: "Unauthorized user" }).end();
    }

    req.user = user;
    next();
  } catch (e) {
    return res.status(401).end();
  }
};

module.exports = { signin, signup, protect };
