const express = require("express");
const session = require("express-session")(config.session);
const cookieParser = require("cookie-parser")(config.session.secret);
const bodyParser = require('body-parser');
const SocketIO = require("socket.io");
const version = require("../../package.json").version;
const HttpController = require("../Controllers/HttpController");
const SocketController = require("../Controllers/SocketController");
const Mail = require("../Tools/Mail");
const TempStorage = require("../Tools/TempStorage");
const Logger = require("../Tools/Logger");
const DateTime = require("../Tools/DateTime");
const MarkdownParser = require("../Tools/MarkdownParser");
const Functions = require("../Tools/Functions");
const Channel = require("../Tools/Channel");
const loadCustomHandler = require("./CustomHandlerLoader");

if (!config.server.socket) {
    config.server.socket = require("../../config").server.socket;
}

require("./ClusterManager"); // Manage cluster/multi-processes.

var app = null,
    httpServer = null,
    httpsServer = null,
    wsServer = null,
    wssServer = null,
    hostname = Array.isArray(config.server.host) ? config.server.host[0] : config.server.host;

exports = module.exports = {
    version,
    ROOT,
    config,
    hostname,
    HttpController,
    SocketController,
    Mail,
    TempStorage,
    Logger,
    DateTime,
    MarkdownParser,
    Functions,
    Channel,
    isMaster: Channel.isMaster,
    isWorker: Channel.isWorker,
    app,
    httpServer,
    httpsServer,
    wsServer,
    wssServer,
    startServer,
    startSocketServer
};

global.wsServer = wsServer;
global.wssServer = wssServer;

/**
 * Start a WebSocket Server.
 * @param {Object} io A Socket.io instance.
 * @param {String} name Make a reference name to the global.
 */
function startSocketServer(io, name = "") {
    if (config.server.workers && !Channel.isWorker)
        return;
    // Handle properties.
    require("../Middleware/SocketPropsHandler")(io);
    // Handle subdomain requests.
    require("../Middleware/SocketSubdomainHandler")(io);
    // Handle cookies.
    require("../Middleware/SocketCookieHandler")(io, cookieParser);
    // Handle sessions.
    require("../Middleware/SocketSessionHandler")(io, session);
    // Handle database connection.
    require("../Middleware/SocketDBHandler")(io);
    // Load user-defined middleware.
    loadCustomHandler(ROOT + "/Middleware/socket", io);
    // Load pre-defined middleware.
    require("../Middleware/SocketAuthHandler")(io);
    require("../Middleware/AutoSocketHandler")(io);
    if (name) {
        global[name] = io;
    }
};

/**
 * Start HTTP server and socket server (if configurations enabled).
 */
function startServer() {
    if (config.server.workers && !Channel.isWorker)
        return;
    app = exports.app = express();
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
    // Parse cookies.
    app.use(cookieParser);
    // Parse request body.
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: true }));
    // Handle accept language.
    require("../Middleware/HttpLanguageHandler")(app);
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

    // Start HTTP server.
    httpServer = exports.httpServer = require("http").Server(app);
    httpServer.setTimeout(config.server.timeout || 120000);
    httpServer.listen(config.server.port, (err) => {
        if (err) {
            console.log(err);
            process.exit(1);
        }
        var port = httpServer.address().port,
            host = `${hostname}` + (port != 80 ? `:${port}` : "");
        console.log("HTTP Server started, please visit http://%s.", host);
    });

    if (config.server.https.port) {
        // Start HTTPS server.
        httpsServer = exports.httpsServer = require("https").Server(config.server.https.credentials, app);
        httpsServer.setTimeout(config.server.timeout || 120000);
        httpsServer.listen(config.server.https.port, (err) => {
            if (err) {
                console.log(err);
                process.exit(1);
            }
            var port = httpsServer.address().port,
                host = `${hostname}` + (port != 443 ? `:${port}` : "");
            console.log("HTTPS Server started, please visit https://%s.", host);
        });
    }

    // Start WebSocket server.
    if (config.server.socket.autoStart) {
        if (!httpsServer || !config.server.https.forceRedirect) {
            // Listen WS protocol.
            exports.wsServer = SocketIO(httpServer, config.server.socket.options);
            startSocketServer(exports.wsServer, "wsServer");
        }

        if (httpsServer) {
            // Listen WSS protocol.
            exports.wssServer = SocketIO(httpsServer, config.server.socket.options);
            startSocketServer(exports.wssServer, "wssServer");
        }
    }
}