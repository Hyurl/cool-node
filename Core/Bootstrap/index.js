const express = require("express");
const bodyParser = require('body-parser');
const app = express();
const session = require("express-session")(config.session);
const cookieParser = require("cookie-parser")(config.session.secret);
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

var httpServer = null,
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
    // Load user-defined middleware.
    loadCustomHandler(ROOT + "/Middleware/http", app);
    // Load pre-defined middleware.
    require("../Middleware/HttpAuthHandler")(app);
    require("../Middleware/AutoRouteHandler")(app);

    // Start HTTP server.
    exports.httpServer = require("http").Server(app);
    exports.httpServer.setTimeout(config.server.timeout || 30000);
    exports.httpServer.listen(config.server.port, (err) => {
        if (err) {
            throw err;
            process.exit(1);
        }
        var port = exports.httpServer.address().port,
            host = `${hostname}` + (port != 80 ? `:${port}` : "");
        console.log("HTTP Server started, please visit http://%s.", host);
    });

    if (config.server.https.port) {
        // Start HTTPS server.
        exports.httpsServer = require("https").Server(config.server.https.credentials, app);
        exports.httpsServer.setTimeout(config.server.timeout || 30000);
        exports.httpsServer.listen(config.server.https.port, (err) => {
            if (err) {
                throw err;
                process.exit(1);
            }
            var port = exports.httpsServer.address().port,
                host = `${hostname}` + (port != 443 ? `:${port}` : "");
            console.log("HTTPS Server started, please visit https://%s.", host);
        });
    }

    // Start WebSocket server.
    if (!config.server.socket) {
        config.server.socket = require("../../config").server.socket || { autoStart: true };
    }

    if (config.server.socket.autoStart) {
        if (!exports.httpsServer || !config.server.https.forceRedirect) {
            // Listen WS protocol.
            exports.wsServer = SocketIO(exports.httpServer, config.server.socket.options);
            startSocketServer(exports.wsServer, "wsServer");
        }

        if (exports.httpsServer) {
            // Listen WSS protocol.
            exports.wssServer = SocketIO(exports.httpsServer, config.server.socket.options);
            startSocketServer(exports.wssServer, "wssServer");
        }
    }
}