const express = require("express");
const bodyParser = require('body-parser');
const app = express();
const session = require("express-session")(config.session);

var loadCustomHandler = require("./CustomHandlerLoader");

// Auto-redirect HTTP to HTTPS.
require("../Middleware/HttpsRedirector")(app);
// Handle subdomain requests.
require("../Middleware/HttpSubdomainHandler")(app);
// Handle static resources.
require("../Middleware/StaticResourceHandler")(app, express);
// Parse request body.
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
// Handler XML.
require("../Middleware/HttpXMLHandler")(app);
// Handle sessions.
app.use(session);
// Handle database connection.
require("../Middleware/HttpDBHandler")(app);
// Load user-defined middleware.
loadCustomHandler(ROOT + "/Middleware/http", app);
// Load pre-defined middleware.
require("../Middleware/HttpAuthHandler")(app);
require("../Middleware/AutoRouteHandler")(app);

var httpServer = null,
    httpsServer = null,
    wsServer = null,
    wssServer = null;

// Start HTTP server.
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
    // Start HTTPS server.
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

// Start WebSocket server.
const SocketIO = require("socket.io");
var initWSServer = (io) => {
    // Handle subdomain requests.
    require("../Middleware/SocketSubdomainHandler")(io);
    // Handle sessions.
    require("../Middleware/SocketSessionHandler")(io, session);
    // Handle database connection.
    require("../Middleware/SocketDBHandler")(io);
    // Load user-defined middleware.
    loadCustomHandler(ROOT + "/Middleware/socket", io);
    // Load pre-defined middleware.
    require("../Middleware/SocketAuthHandler")(io);
    require("../Middleware/AutoSocketHandler")(io);
};

if(!config.server.socket){
    config.server.socket = require("../../config").server.socket || {autoStart: true};
}

if (config.server.socket.autoStart) {
    if (!httpsServer || !config.server.https.forceRedirect) {
        // Listen WS protocol.
        wsServer = SocketIO(httpServer, config.server.socket.options);
        initWSServer(wsServer);
    }

    if (httpsServer) {
        // Listen WSS protocol.
        wssServer = SocketIO(httpsServer, config.server.socket.options);
        initWSServer(wssServer);
    }
}

global.wsServer = wsServer;
global.wssServer = wssServer;

module.exports = {
    app,
    httpServer,
    httpsServer,
    wsServer,
    wssServer,
    initWSServer
};