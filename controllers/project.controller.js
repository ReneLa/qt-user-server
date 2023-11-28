const { db } = require("../lib/db");

const getProjects = async (req, res) => {
  try {
    const { id } = req.user;
    if (!id) {
      return res.status(400).send({ message: "Un-authorized" });
    }

    const projects = await db.project.findMany({});

    res.status(200).json({ projects });
  } catch (err) {
    console.error(err);
    res.status(400).end();
  }
};

module.exports = { getProjects };
