const express = require("express");
const bodyParser = require('body-parser');
const app = express();
const session = require("express-session")(config.session);
const version = require("../../package.json").version;
const HttpController = require("../Controllers/HttpController");
const SocketController = require("../Controllers/SocketController");
const Mail = require("../Tools/Mail");
const Logger = require("../Tools/Logger");
const DateTime = require("../Tools/DateTime");
const Functions = require("../Tools/Functions");
const MarkdownParser = require("../Tools/MarkdownParser");

var loadCustomHandler = require("./CustomHandlerLoader");

// Initial headers.
app.set("x-powered-by", false);
if (config.server.showInfo || config.server.showInfo === undefined) {
    var expressVersion = require("express/package.json").version;
    app.use((req, res, next) => {
        res.set({
            "Server": `Express/${expressVersion} Node.js/${process.version}`,
            "X-Powered-By": `Cool-Node/${version}`
        });
        next();
    });
}

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

var hostname = Array.isArray(config.server.host) ? config.server.host[0] : config.server.host;

// Start HTTP server.
httpServer = require("http").Server(app);
httpServer.setTimeout(config.server.timeout || 30000);
httpServer.listen(config.server.port, (err) => {
    if (err) {
        throw err;
        process.exit(1);
    }
    var port = httpServer.address().port,
        host = `${hostname}` + (port != 80 ? `:${port}` : "");
    console.log("HTTP Server started, please visit http://%s.", host);
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
        var port = httpsServer.address().port,
            host = `${hostname}` + (port != 443 ? `:${port}` : "");
        console.log("HTTPS Server started, please visit https://%s.", host);
    });
}

// Start WebSocket server.
const SocketIO = require("socket.io");
var initWSServer = (io) => {
    // Handle properties.
    require("../Middleware/SocketPropsHandler")(io);
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

if (!config.server.socket) {
    config.server.socket = require("../../config").server.socket || { autoStart: true };
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
    version,
    ROOT,
    config,
    app,
    httpServer,
    httpsServer,
    wsServer,
    wssServer,
    initWSServer,
    HttpController,
    SocketController,
    Mail,
    Logger,
    DateTime,
    MarkdownParser,
    Functions
};