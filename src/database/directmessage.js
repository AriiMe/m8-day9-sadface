module.exports = (sequelize, DataTypes) => {
    const DirectMessage = sequelize.define(
        "directmessage",
        {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
            },
            text: {
                type: DataTypes.STRING,
                allowNull: false,
            },

            imgurl: {
                type: DataTypes.STRING(500),
                allowNull: true,
            },

        },
        { timestamps: true }
    );
    DirectMessage.associate = (models) => {
        DirectMessage.belongsTo(models.Profile);
        DirectMessage.belongsTo(models.Room);
    };
    return DirectMessage;
};