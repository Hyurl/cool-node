const path = require("path");
global.ROOT = path.normalize(__dirname).replace(/\\/g, "/");
global.config = require("./config");
const express = require("express");
const bodyParser = require('body-parser');
const app = express();
const session = require("express-session")(config.session);

//Load bootstrap.
require("./Core/Bootstrap/ControllerLoader");

//Auto-redirect HTTP to HTTPS.
require("./Core/Middleware/HttpsRedirector")(app);
//Handle subdomain requests.
require("./Core/Middleware/HttpSubdomainHandler")(app);
//Handle static resources.
require("./Core/Middleware/StaticResourceHandler")(app, express);
//Parse request body.
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
//Handle sessions.
app.use(session);
//Handle database connection.
require("./Core/Middleware/HttpDBHandler")(app);
//Load user-defined middleware.
require("./Middleware/http")(app);
//Load pre-defined middleware.
require("./Core/Middleware/HttpAuthHandler")(app);
require("./Core/Middleware/HomeRouteHandler")(app);
require("./Core/Middleware/AutoRouteHandler")(app);

var server, httpsServer, io, ios;

//Start HTTP server.
server = require("http").Server(app);
server.listen(config.server.port, (err) => {
    if (err) {
        throw err;
        process.exit(1);
    }
    var host = config.server.host;
    var port = server.address().port;
    console.log("HTTP Server started, please visit http://%s:%s.", host, port);
});

if (config.server.https.port) {
    //Start HTTPS server.
    httpsServer = require("https").Server(config.server.https.credentials, app);
    httpsServer.listen(config.server.https.port, (err) => {
        if (err) {
            throw err;
            process.exit(1);
        }
        var host = config.server.host;
        var port = httpsServer.address().port;
        console.log("HTTPS Server started, please visit https://%s:%s.", host, port);
    });
}

//Start WebSocket server.
var applySocketMiddleware = (io) => {
    //Handle subdomain requests.
    require("./Core/Middleware/SocketSubdomainHandler")(io);
    //Handle sessions.
    require("./Core/Middleware/SocketSessionHandler")(io, session);
    //Handle database connection.
    require("./Core/Middleware/SocketDBHandler")(io);
    //Load user-defined middleware.
    require("./Middleware/socket")(io);
    //Load pre-defined middleware.
    require("./Core/Middleware/SocketAuthHandler")(io);
    require("./Core/Middleware/AutoSocketHandler")(io);
};
if(!httpsServer || !config.server.https.forceRedirect){
    //Listen WS protocol.
    io = require("socket.io")(server);
    applySocketMiddleware(io);
    io.on('connection', (socket) => {});
}
if(httpsServer){
    //Listen WSS protocol.
    ios = require("socket.io")(httpsServer);
    applySocketMiddleware(ios);
    ios.on('connection', (socket) => {});
}