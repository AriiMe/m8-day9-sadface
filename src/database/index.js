const { Sequelize, DataTypes } = require("sequelize");
const Post = require("./posts");
const Profile = require("./profile");
const Expirience = require("./exp");
const Comment = require("./comments");
const Like = require("./likes");
const CommentLike = require("./commentlikes");
const Message = require("./messages");
const DirectMessage = require("./directmessage");
const Room = require("./rooms");

const sequelize = new Sequelize( //AUTHORIIZES AND STARTS SEQUELIZE
    process.env.PGDATABASE, //DATABASE NAME
    process.env.PGUSER, //PG USERNAME
    process.env.PGPASSWORD, //PG PASSWORD
    {
        host: process.env.PGHOST, //HOST NAME
        dialect: "postgres",
        // THIS IS THE LANGUAGE THAT WE ARE USING WITH SEQUELIZE
        // dialectOptions: {
        //     ssl: {
        //         require: true,
        //         rejectUnauthorized: false,
        //     },
        // },
    }
);

const models = {
    //OBJECT CONTAINING MODELS OF THE TABLES
    Profile: Profile(sequelize, DataTypes),
    Post: Post(sequelize, DataTypes),
    Expirience: Expirience(sequelize, DataTypes),
    Comment: Comment(sequelize, DataTypes),
    Like: Like(sequelize, DataTypes),
    CommentLike: CommentLike(sequelize, DataTypes),
    Message: Message(sequelize, DataTypes),
    DirectMessage: DirectMessage(sequelize, DataTypes),
    Room: Room(sequelize, DataTypes),
};

//GOES THROUGH EACH KEY OF THE MODEL OBJECT ABOVE (e.g. Author: Author(sequelize, DataTypes)) AND CREATES TABLE RELATIONS DEPENDING ON CODE INSIDE EACH MODEL
Object.keys(models).forEach((modelName) => {
    if ("associate" in models[modelName]) {
        //IF THE WORD ASSOCIATE IS PRESENT INSIDE THE MODEL, IT WILL RUN THE FOLLOWING CODE
        models[modelName].associate(models); //RUNS THE .associate INSIDE THE MODEL, WHICH IS CODE THAT DEFINES THE TABLES RELATIONS
    }
});

models.sequelize = sequelize; //PUTS TABLE MODELS INTO SEQUELIZE
models.Sequelize = Sequelize; //IDK WHAT THIS DOES :(

sequelize
    .authenticate() //TESTS IF SEQUELIZE IS CONNECTED TO OUR DATABASE
    .then(() => console.log("Connected"))
    .catch((e) => {
        console.log("not connected"), console.log(e);
    });

module.exports = models; //EXPORTS SEQUELIZE CONTAINING TABLE MODELS TO SERVER.JS
