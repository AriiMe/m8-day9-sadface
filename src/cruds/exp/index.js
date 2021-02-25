const express = require("express");
const Expirience = require("../../database").Expirience;
const Profile = require("../../database").Profile
const Json2csvParser = require("json2csv").Parser;
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


router.get("/:profileId/exp", async (req, res) => {
    try {

        const allExpiriences = await Expirience.findAll({
            where: { profileId: req.params.profileId },
            include: [Profile],
        });
        res.send(allExpiriences);
    } catch (error) {
        console.log(error);
        res.status(500).send("Something went wrong!");
    }
});

router.get("/:id", async (req, res) => {
    try {
        const singleExpirience = await Expirience.findByPk(req.params.id);
        res.send(singleExpirience);
    } catch (error) {
        console.log(error);
        res.status(500).send("Something went wrong!");
    }
});

router.delete("/:id", async (req, res) => {
    try {
        if (req.profile.id === req.params.id) {
            await Expirience.destroy({ where: { id: req.params.id } });
            res.send("Expirience destroyed");
        } else {
            res.status(401).send('unauthorized')
        }

    } catch (error) {
        console.log(error);
        res.status(500).send("Something went wrong!");
    }
});

router.put(
    "/:id",
    cloudinaryMulter.single("ExpImage"),
    async (req, res) => {
        try {
            console.log(req.body)
            if (req.profile.id === parseInt(req.body.profileId)) {
                const alteredExp = await Expirience.update(

                    { ...req.body, profileId: req.profile.id, imgurl: req.file.path },
                    {
                        where: { id: req.params.id },
                        returning: true,
                    }

                );
                res.send(alteredExp);
            } else {
                res.status(401).send('unauthorized')
            }

        } catch (error) {
            console.log(error);
            res.status(500).send("Something went bad!");
        }
    }
);


router.post(
    "/:profileId",
    cloudinaryMulter.single("ExpImage"),
    async (req, res) => {
        try {
            console.log(req.body)
            if (req.profile.id === parseInt(req.params.profileId)) {
                const alteredExp = await Expirience.create(
                    { ...req.body, profileId: req.profile.id, imgurl: req.file.path },

                );
                res.send(alteredExp);
            } else {
                res.status(401).send('unauthorized')
            }

        } catch (error) {
            console.log(error);
            res.status(500).send("Something went bad!");
        }
    }
);

//CSV

router.get("/:profileId/downloadcsv", async (req, res) => {
    try {

        const experience = await Expirience.findAll({
            where: { profileId: req.params.profileId, }
        });
        const fields = [
            "id",
            "role",
            "company",
            "startdate",
            "enddate",
            "description",
            "area",
            "imgurl",
        ];
        const json2csvParser = new Json2csvParser({ fields })
        const csvData = json2csvParser.parse(experience)
        res.setHeader(
            "Content-disposition",
            "attachment; filename=mfikncsvworksyeet.csv"
        );
        res.set("Content-Type", "text/csv");
        res.status(200).send(csvData);
    } catch (error) {
        console.log(error)
        next(error)
    }
})

module.exports = router;