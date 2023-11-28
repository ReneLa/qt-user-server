const router = require("express").Router();
const passport = require("passport");

const {} = require("../controllers/task.controller");

const decodeToken = require("../middlewares/auth/decodeToken");

const requireAuth = passport.authenticate("jwt", { session: false }, null);

router.use(requireAuth, decodeToken);

router.get("/:id");
router.get("/");

router.post("/");

router.delete("/:id");

router.patch("/:id/save");

module.exports = router;
