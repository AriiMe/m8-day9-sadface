const express = require("express");
const Post = require("../../database").Post;
const Comment = require("../../database").Comment;
const CommentLike = require("../../database").CommentLike;
const Profile = require("../../database").Profile;

const router = express.Router();

router.post("/:profileId/:commentId", async (req, res) => {
    try {
        const like = await CommentLike.findOne({ where: { profileId: req.params.profileId, commentId: req.params.commentId } })
        if (like) {
            await CommentLike.destroy({ where: { profileId: req.params.profileId, commentId: req.params.commentId } })
        } else {
            const newLike = await CommentLike.create({ profileId: req.params.profileId, commentId: req.params.commentId });
        }
        console.log(like)
        res.status(201).send('ok');
    } catch (error) {
        console.log(error);
        res.status(500).send("Something went bad!");
    }
});



router.get("/:profileId/:commentId/commentlikes", async (req, res) => {
    try {

        const likes = await CommentLike.count({ where: { commentId: req.params.commentId } })
        const like = await CommentLike.findOne({ where: { profileId: req.params.profileId, commentId: req.params.commentId } })
        const data = {
            total: likes
        }
        if (like) {
            data.isLiked = true

        } else {
            data.isLiked = false
        }

        res.send(data);
    } catch (error) {
        console.log(error);
        res.status(500).send("Something went bad!");
    }
});

router.delete("/:id", async (req, res) => {
    try {
        await CommentLike.destroy({ where: { id: req.params.id } });
        res.send("like removed");
    } catch (error) {
        console.log(error);
        res.status(500).send("Something went bad!");
    }
});




module.exports = router;