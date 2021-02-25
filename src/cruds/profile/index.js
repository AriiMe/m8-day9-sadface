const express = require("express");
const Profile = require("../../database").Profile; //BECAUSE DATABASE/INDEX.JS IS EXPORTING A MODELS OBJECT, WE CAN CALL THE Article MODEL STRAIGHT FROM THIS OBJECT
const Post = require("../../database").Post;
const Expirience = require("../../database").Expirience;
const Comment = require("../../database").Comment;
const multer = require("multer");
const jwt = require("jsonwebtoken");
const accessTokenSecret = process.env.ACCESS_TOKEN_SECRET;
const PDFDocument = require("pdfkit");
const axios = require("axios");

const cloudinary = require("../../cloudinary");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const authenticate = require("../../auth");
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "samples",
  },
});
const cloudinaryMulter = multer({ storage: storage });

const router = express.Router();

router.post("/login", async (req, res) => {
  // Read username and password from request body
  const { username, password } = req.body;

  // Filter user from the profile array by username and password
  const profile = await Profile.findOne({
    where: { username: username, password: password }, raw: true
  });
  console.log('profile', profile)
  if (profile) {
    // Generate an access token
    console.log('login', profile.id)
    const accessToken = jwt.sign(
      { id: profile.id },
      process.env.ACCESS_TOKEN_SECRET
    );

    res.json({
      accessToken,
    });
  } else {
    res.send("Username or password incorrect");
  }
});
router.post("/", async (req, res) => {
  try {
    const newProfile = await Profile.create(req.body); //.create IS A SEQUELIZE METHOD DOR MODELS, IT CREATES A NEW ROW IN THE TABLE

    res.status(201).send(newProfile);
  } catch (error) {
    console.log(error);
    res.status(500).send("Something went wrong!");
  }
});

router.get("/", authenticate, async (req, res) => {
  try {
    const allProfiles = await Profile.findAll({
      include: [Post, Expirience, Comment],
    }); //.findAll RETURNS ALL OF THE ArticleS. include:[] IS AN ARRAY THAT CONNECTS MODELS WITH THE REQUEST. THIS IS DONE SO AUTHORID CAN GET THE CORRESPONDING AUTHOR OBJECT
    res.send(allProfiles);
  } catch (error) {
    console.log(error);
    res.status(500).send("Something went wrong!");
  }
});

router.get("/:id", authenticate, async (req, res) => {
  try {
    if (req.params.id === "me") {
      console.log(req.profile)
      res.send(req.profile);
    } else {
      const singleProfile = await Profile.findByPk(req.params.id, {
        include: [Post, Expirience, Comment],
      }); //.findByPk RETURNS THE Article WITH THE MATCHING ID
      res.send(singleProfile);
    }
  } catch (error) {
    console.log(error);
    res.status(500).send("Something went wrong!");
  }
});

router.delete("/:id", authenticate, async (req, res) => {
  try {
    await Profile.destroy({ where: { id: req.params.id } }); //.destroy DESTROYS ROWS. CAN DESTROY MULTIPLE BASED ON FILTER. WILL DESTRY ALL WITHOUT A FILTER
    res.send("profile destroyed");
  } catch (error) {
    console.log(error);
    res.status(500).send("Something went wrong!");
  }
});

router.put("/:id", authenticate, async (req, res) => {
  try {
    if (req.profile.id === req.params.id) {
      const alteredProfile = await Profile.update(req.body, {
        where: { id: req.params.id },
        include: [Post, Expirience],
        returning: true,
      });
      res.send(alteredProfile);
    } else {
      res.status(401).send("unauthorized");
    }
  } catch (error) {
    console.log(error);
    res.status(500).send("Something went wrong!");
  }
});


router.put(
  "/:id/upload",
  cloudinaryMulter.single("ProfileImage"),
  async (req, res) => {
    try {
      const alteredPost = await Profile.update(
        { ...req.body, imgurl: req.file.path },
        {
          where: { id: req.params.id },
          returning: true,
        }
      );
      res.send(alteredPost);
    } catch (error) {
      console.log(error);
      res.status(500).send("Something went bad!");
    }
  }
);

//pdf

router.get("/:id/profilePDF", async (req, res, next) => {
  try {
    const profile = await Profile.findByPk(req.params.id);
    let experience = await Expirience.findAll({
      where: { profileId: req.params.id },
      raw: true,
    });
    // experience = experience.get({ plain: true })
    console.log(experience);
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=${profile.name}.pdf`
    );

    async function example() {
      const doc = new PDFDocument();
      await axios
        .get(profile.imgurl, { responseType: "arraybuffer" })
        .then((response) => {
          const imageBuffer = Buffer.from(response.data);
          doc.image(imageBuffer, 15, 15, { width: 250, height: 270 });
        });
      doc.text("PERSONAL INFOS", 350, 20);
      doc.text("EXPERIENCES", 230, 325);

      row(doc, 40);
      row(doc, 60);
      row(doc, 80);
      row(doc, 100);
      row(doc, 120);
      row(doc, 210);
      row(doc, 230);
      row(doc, 250);
      row(doc, 270);
      row(doc, 290);
      row(doc, 310);
      textInRowFirst(doc, "Name:", 40);
      textInRowFirst(doc, "Surname:", 60);
      textInRowFirst(doc, "Email:", 80);
      textInRowFirst(doc, "Area:", 100);
      textInRowFirst(doc, "Username:", 120);

      textInRowSecond(doc, profile.name, 40);
      textInRowSecond(doc, profile.surename, 60);
      textInRowSecond(doc, profile.email, 80);
      textInRowSecond(doc, profile.area, 100);
      textInRowSecond(doc, profile.username, 120);

      const exLineHeight = 345;
      const addSpace = 160;
      const jForLenght = experience.length;

      let LineHeight = exLineHeight;
      for (let i = 0; i < jForLenght; i++) {
        textInRowFirstExperiences(doc, "Role:", LineHeight); //345
        textInRowFirstExperiences(doc, "Company:", LineHeight + 20); //365
        textInRowFirstExperiences(doc, "Start Date:", LineHeight + 40); // 385
        textInRowFirstExperiences(doc, "End Date:", LineHeight + 60); // 405
        textInRowFirstExperiences(doc, "Description:", LineHeight + 80); // 425
        textInRowFirstExperiences(doc, "Area:", LineHeight + 100); // 445

        textInRowSecondExperiences(doc, experience[i].role, LineHeight); //345
        textInRowSecondExperiences(doc, experience[i].company, LineHeight + 20);
        textInRowSecondExperiences(
          doc,
          experience[i].startdate,
          LineHeight + 40
        );
        textInRowSecondExperiences(doc, experience[i].enddate, LineHeight + 60);
        textInRowSecondExperiences(
          doc,
          experience[i].description,
          LineHeight + 80
        );
        textInRowSecondExperiences(doc, experience[i].area, LineHeight + 100); // 445

        LineHeight = exLineHeight + addSpace * (i + 1);
      }

      doc.pipe(res);
      doc.end();
      doc.on("finish", function () {
        return res.status(200).json({
          ok: "ok",
        });
      });
    }

    function textInRowFirst(doc, text, heigth) {
      doc.y = heigth;
      doc.x = 275;
      doc.fillColor("black");
      doc.text(text, {
        paragraphGap: 5,
        indent: 5,
        align: "justify",
        columns: 1,
      });
      return doc;
    }

    function textInRowSecond(doc, text, heigth) {
      doc.y = heigth;
      doc.x = 375;
      doc.fillColor("black");
      doc.text(text, {
        paragraphGap: 5,
        indent: 5,
        align: "justify",
        columns: 1,
      });
      return doc;
    }

    function textInRowFirstExperiences(doc, text, heigth) {
      doc.y = heigth;
      doc.x = 15;
      doc.fillColor("black");
      doc.text(text, {
        paragraphGap: 5,
        indent: 5,
        align: "justify",
        columns: 1,
      });
      return doc;
    }

    function textInRowSecondExperiences(doc, text, heigth) {
      doc.y = heigth;
      doc.x = 120;
      doc.fillColor("black");
      doc.text(text, {
        paragraphGap: 5,
        indent: 5,
        align: "justify",
        columns: 1,
      });
      return doc;
    }

    function row(doc, heigth) {
      doc.lineJoin("miter").rect(30, heigth, 500, 20);
      return doc;
    }
    example();
  } catch (error) {
    console.log(error);
    next("While reading profiles list a problem occurred!");
  }
});

module.exports = router;
