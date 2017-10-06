const path = require("path");
global.ROOT = path.normalize(__dirname).replace(/\\/g, "/");
global.config = require("./config");
const express = require("express");
const bodyParser = require('body-parser');
const app = express();
const session = require("express-session")(config.session);

//Load bootstrap.
require("./Core/Bootstrap/ControllerLoader");
var loadCustomHandler = require("./Core/Bootstrap/CustomHandlerLoader");

//Auto-redirect HTTP to HTTPS.
require("./Core/Middleware/HttpsRedirector")(app);
//Handle subdomain requests.
require("./Core/Middleware/HttpSubdomainHandler")(app);
//Handle static resources.
require("./Core/Middleware/StaticResourceHandler")(app, express);
//Parse request body.
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
//Handler XML.
require("./Core/Middleware/HttpXMLHandler")(app);
//Handle sessions.
app.use(session);
//Handle database connection.
require("./Core/Middleware/HttpDBHandler")(app);
//Load user-defined middleware.
loadCustomHandler(ROOT + "/Middleware/http", app);
//Load pre-defined middleware.
require("./Core/Middleware/HttpAuthHandler")(app);
require("./Core/Middleware/HomeRouteHandler")(app);
require("./Core/Middleware/AutoRouteHandler")(app);

var httpServer, httpsServer, wsServer, wssServer;

//Start HTTP server.
httpServer = require("http").Server(app);
httpServer.setTimeout(config.server.timeout || 30000);
httpServer.listen(config.server.port, (err) => {
    if (err) {
        throw err;
        process.exit(1);
    }
    var host = config.server.host;
    var port = httpServer.address().port;
    console.log("HTTP Server started, please visit http://%s:%s.", host, port);
});

if (config.server.https.port) {
    //Start HTTPS server.
    httpsServer = require("https").Server(config.server.https.credentials, app);
    httpsServer.setTimeout(config.server.timeout || 30000);
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
const SocketIO = require("socket.io");
var applySocketMiddleware = (io) => {
    //Handle subdomain requests.
    require("./Core/Middleware/SocketSubdomainHandler")(io);
    //Handle sessions.
    require("./Core/Middleware/SocketSessionHandler")(io, session);
    //Handle database connection.
    require("./Core/Middleware/SocketDBHandler")(io);
    //Load user-defined middleware.
    loadCustomHandler(ROOT + "/Middleware/socket", io);
    //Load pre-defined middleware.
    require("./Core/Middleware/SocketAuthHandler")(io);
    require("./Core/Middleware/AutoSocketHandler")(io);
};
if(!httpsServer || !config.server.https.forceRedirect){
    //Listen WS protocol.
    wsServer = SocketIO(httpServer);
    applySocketMiddleware(wsServer);
}
if(httpsServer){
    //Listen WSS protocol.
    wssServer = SocketIO(httpsServer);
    applySocketMiddleware(wssServer);
}

global.wsServer = wsServer;
global.wssServer = wssServer;