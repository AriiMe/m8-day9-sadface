module.exports = (sequelize, DataTypes) => {
    const Room = sequelize.define(
        "room",
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
        },
        { timestamps: true }
    );
    Room.associate = (models) => {
        Room.hasMany(models.Message);
    };
    return Room;
};