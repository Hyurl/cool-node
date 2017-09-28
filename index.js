const path = require("path");
const ROOT = path.normalize(__dirname).replace(/\\/g, "/");
const config = require("./config");
const express = require("express");
const bodyParser = require('body-parser');
const app = express();
const router = express.Router();
const server = require("http").Server(app);
const io = require("socket.io")(server);
const ExpressSession = require("express-session");
const session = ExpressSession(config.session);

global.ROOT = ROOT;
global.config = config;

//Load bootstrap.
require("./Core/Bootstrap/ControllerLoader");

//Handle static resources.
app.use(express.static("Public"));
//Parse request body.
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
//Handle sessions.
app.use(session);
//Handle database connection.
app.use(require("./Core/Middleware/HttpDBHandler"));
//Load user-defined middleware.
require("./Middleware/http")(app);
//Load pre-defined middleware.
require("./Core/Middleware/HttpAuthHandler")(app);
require("./Core/Middleware/HomeRouteHandler")(app);
require("./Core/Middleware/AutoRouteHandler")(app);

//Start HTTP server.
server.listen(config.server.port, () => {
    var host = config.server.host;
    var port = server.address().port;
    console.log("Server started, please visit http://%s:%s.", host, port);
});

//Handle sessions.
require("./Core/Middleware/SocketSessionHandler")(io, session);
//Handle database connection.
require("./Core/Middleware/SocketDBHandler")(io);
//Load user-defined middleware.
require("./Middleware/socket")(io);
//Load pre-defined middleware.
require("./Core/Middleware/SocketAuthHandler")(io);
require("./Core/Middleware/AutoSocketHandler")(io);

//Accept socket connection.
io.on('connection', (socket) => {});