const express = require("express");
const Post = require("../../database").Post;
const Profile = require("../../database").Profile;
const Comment = require("../../database").Comment;
const Like = require("../../database").Like;
const multer = require("multer");
const cloudinary = require("../../cloudinary");
const { CloudinaryStorage } = require("multer-storage-cloudinary");

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: "samples",
    },
});
const cloudinaryMulter = multer({ storage: storage });

const router = express.Router();

router.post("/", async (req, res) => {
    try {
        const newPost = await Post.create(req.body); //.create IS A SEQUELIZE METHOD DOR MODELS, IT CREATES A NEW ROW IN THE TABLE
        res.status(201).send(newPost);
    } catch (error) {
        console.log(error);
        res.status(500).send("Something went bad!");
    }
});

router.get("/", async (req, res) => {
    try {
        const allPosts = await Post.findAll({
            include: [Profile, { model: Comment, include: Profile }, Like],
        }); //.findAll RETURNS ALL OF THE Posts
        res.send(allPosts);
    } catch (error) {
        console.log(error);
        res.status(500).send("Something went bad!");
    }
});

router.get("/:id", async (req, res) => {
    try {

        const singlePost = await Post.findByPk(req.params.id, {
            include: [Profile, Comment],
        }); //.findByPk RETURNS THE Post WITH THE MATCHING ID
        res.send(singlePost);
    } catch (error) {
        console.log(error);
        res.status(500).send("Something went bad!");
    }
});

router.delete("/:id", async (req, res) => {
    try {
        const postToDelete = await Post.findByPk(req.params.id)
        if (postToDelete.profileId === req.profile.id) {
            await Post.destroy({ where: { id: req.params.id } }); //.destroy DESTROYS ROWS. CAN DESTROY MULTIPLE BASED ON FILTER. WILL DESTRY ALL WITHOUT A FILTER
            res.send("post destroyed");
        } else {
            res.status(401).send('unauthorized')
        }

    } catch (error) {
        console.log(error);
        res.status(500).send("Something went bad!");
    }
});

router.put("/:id", async (req, res) => {
    try {
        const postToDelete = await Post.findByPk(req.params.id)
        if (postToDelete.profileId === req.profile.id) {
            const alteredPosts = await Post.update(req.body, {
                where: { id: req.params.id },
                returning: true,
            });
            res.send(alteredPosts);
        }
        else {
            res.status(401).send('unauthorized')
        }

    } catch (error) {
        console.log(error);
        res.status(500).send("Something went bad!");
    }
});

router.post(
    "/:id/upload",
    cloudinaryMulter.single("PostImage"),
    async (req, res) => {
        try {
            const alteredPost = await Post.create(
                { ...req.body, profileId: req.profile.id, imgurl: req.file.path },

            );
            res.send(alteredPost);
        } catch (error) {
            console.log(error);
            res.status(500).send("Something went bad!");
        }
    }
);

module.exports = router;
