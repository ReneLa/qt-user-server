const { db } = require("../lib/db");

const me = async (req, res) => {
  res.status(200).json({ data: req.user });
};

const getUsers = async (req, res) => {
  try {
    const { id } = req.user;
    if (!id) {
      return res.status(400).send({ message: "Un-authorized" });
    }

    const users = await db.user.findMany({
      where: {
        id: {
          not: id
        }
      }
    });

    res.status(200).json({ users });
  } catch (err) {
    console.error(err);
    res.status(400).end();
  }
};

const updateUser = async (req, res) => {
  try {
    const { id } = req.user;
    if (!id) {
      return res.status(400).send({ message: "An authorized" });
    }
    const params = await req.body;

    const updatedUser = await db.user.update({
      where: {
        id
      },
      data: {
        ...params
      }
    });

    if (!updatedUser) {
      return res.status(400).send({ message: "User not updated" }).end();
    }
    res.status(200).json({ message: "Updated successfully", data: updateUser });
  } catch (err) {
    console.error(err);
    res.status(400).end();
  }
};

module.exports = { me, getUsers, updateUser };
