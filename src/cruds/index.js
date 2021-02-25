const express = require("express");
const authenticate = require("../auth");
const router = express.Router();
const profileRoute = require("./profile");
const postRoute = require("./posts");
const expRoute = require("./exp");
const commentRoute = require("./comments");
const likeRoute = require("./like");
const commentLikeRoute = require("./commentlikes");

router.use("/profile", profileRoute);
router.use("/posts", authenticate, postRoute);
router.use("/exp", authenticate, expRoute);
router.use("/comments", authenticate, commentRoute);
router.use("/like", authenticate, likeRoute);
router.use("/commentlike", authenticate, commentLikeRoute);
module.exports = router;
