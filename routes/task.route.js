const router = require("express").Router();

const {
  getTasks,
  createTask,
  updateTask
} = require("../controllers/task.controller");

router.get("/", getTasks);
router.get("/:id");
router.post("/", createTask);
router.patch("/:id", updateTask);
router.delete("/:id");

module.exports = router;
