const Profile = require("./database").Profile;
const jwt = require("jsonwebtoken");
const authenticate = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (authHeader) {
    const token = authHeader.split(" ")[1];

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, async (err, user) => {
      if (err) {
        res.sendStatus(403);
      }
      console.log('user', user)
      const profile = await Profile.findByPk(user.id);
      console.log(profile)
      req.profile = profile;
      next();
    });
  } else {
    res.sendStatus(401);
  }
};

module.exports = authenticate;
