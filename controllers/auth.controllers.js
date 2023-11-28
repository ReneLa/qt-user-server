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
        email: true,
        first_name: true,
        last_name: true,
        title: true,
        caption: true
      }
    });
    const token = newToken(newUser);
    return res.status(201).send({ user: { email }, token });
  } catch (e) {
    console.log(e);
    return res.status(500).send({ message: "Server Error" }).end();
  }
};

const signin = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).send({ message: "Need email and password" });
  }

  try {
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
      user: { username: existingUser.username, email: existingUser.email },
      token
    });
  } catch (e) {
    console.error(e);
    res.status(500).send({ message: "Server Error" }).end();
  }
};

const protect = async (req, res, next) => {
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

  const user = await db.user.findById({
    where: {
      id: payload.id
    },
    select: {
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
};

module.exports = { signin, signup, protect };
