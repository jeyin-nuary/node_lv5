const express = require('express');
const router = express.Router();

const postRouter = require("../routes/posts.routes");
const userRouter = require("../routes/users.routes");
const commentRouter = require("../routes/comments.routes");
const likeRouter = require("../routes/likes.routes");

router.use("/users", [userRouter]);
router.use("/posts", [postRouter]);
router.use("/comments", [commentRouter]);
router.use("/likes", [likeRouter]);


module.exports = router;