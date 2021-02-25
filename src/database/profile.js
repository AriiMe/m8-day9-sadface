module.exports = (sequelize, DataTypes) => {
  const Profile = sequelize.define(
    "profile",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      surename: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      bio: {
        type: DataTypes.STRING(500),
        allowNull: false,
      },
      title: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      area: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      imgurl: {
        type: DataTypes.STRING(500),
        allowNull: false,
      },
      username: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    },
    { timestamps: true }
  );
  Profile.associate = (models) => {
    Profile.hasMany(models.Post);
    Profile.hasMany(models.Expirience);
    Profile.hasMany(models.Comment);
    Profile.hasMany(models.Like);
    Profile.hasMany(models.Message);

  };
  return Profile;
};
