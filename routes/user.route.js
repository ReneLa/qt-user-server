const router = require("express").Router();

const { me, getUsers, updateUser } = require("../controllers/user.controller");

router.get("/", me);
router.get("/all", getUsers);
router.patch("/", updateUser);

module.exports = router;
