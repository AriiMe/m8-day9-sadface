const express = require("express");
const database = require("./database");
const cors = require("cors");
const authenticate = require("./auth");
const http = require("http")

const crudsRoute = require("./cruds");
const createSocketServer = require("./socket.js")

const server = express();
const port = process.env.PORT || 9001;
const chatPort = process.env.CHATPORT || 8008

const httpServer = http.createServer(server)
createSocketServer(httpServer)

server.use(cors());
server.use(express.json());

server.use("/api", crudsRoute);

database.sequelize.sync({ force: false }).then((result) => {
  httpServer.listen(chatPort, () => {
    console.log("Chatting on port", chatPort);
  })
});
