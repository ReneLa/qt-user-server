const router = require("express").Router();
const passport = require("passport");

const {} = require("../controllers/user.controller");

const decodeToken = require("../middlewares/auth/decodeToken");
const requireAuth = passport.authenticate("jwt", { session: false }, null);

router.get("/:id", requireAuth);

router.post("/signup");
router.post("/refresh-token");
router.post("/signin");
router.post("/logout");

router.put("/:id");

module.exports = router;
