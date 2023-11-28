const { db } = require("../lib/db");

const getTasks = async (req, res) => {
  try {
    const { id } = req.user;
    if (!id) {
      return res.status(400).send({ message: "Un-authorized" });
    }

    const tasks = await db.task.findMany({
      where: {
        userId: id
      }
    });

    res.status(200).json({ data: tasks });
  } catch (err) {
    console.error(err);
    res.status(400).end();
  }
};

const createTask = async (req, res) => {
  try {
    const { id } = req.user;
    if (!id) {
      return res.status(400).send({ message: "Un-authorized" });
    }
    const params = await req.body;

    const newTask = await db.user.create({
      data: {
        userId: id,
        ...params
      },
      select: {
        name: true,
        start_date: true,
        end_date: true,
        description: true,
        priority: true,
        fileUrl: true
      }
    });
    return res.status(201).send({ message: "Task Created", task: newTask });
  } catch (e) {
    console.log(e);
    return res.status(500).send({ message: "Server Error" }).end();
  }
};

const updateTask = async (req, res) => {
  try {
    const { id } = req.user;
    if (!id) {
      return res.status(400).send({ message: "Un-authorized" });
    }
    const params = await req.body;

    const updatedTask = await db.task.update({
      where: {
        id
      },
      data: {
        ...params
      }
    });

    if (!updatedTask) {
      return res.status(400).send({ message: "Task not updated" }).end();
    }
    res.status(200).json({ message: "Updated successfully", data: updateTask });
  } catch (err) {
    console.error(err);
    res.status(400).end();
  }
};

module.exports = { getTasks, updateTask, createTask };
