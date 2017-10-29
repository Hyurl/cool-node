const session = require("express-session");
const MemoryStore = require('memorystore')(session);

// Some of these settings are for their dependencies, you may check out all 
// supported options on their official websites.
module.exports = {
    server: {
        host: "localhost", // For splitting subdomains, could be an array.
        port: 80,
        timeout: 120000, // 2 min.
        showInfo: true, // Show headers like Server and X-Powered-By.
        https: {
            port: 0, // If set, start a HTTPS server.
            forceRedirect: true, // If true, always redirect HTTP to HTTPS.
            credentials: { // You could use {pfx, passphrase} as well.
                key: "",
                cert: "",
            }
        },
        socket: { // Settings for Socket.io.
            autoStart: true,
            options: {
                pingTimeout: 5000,
                pingInterval: 5000,
            },
        },
        error: { // Error settings only suit development environment.
            stack: false, // If true, display full error info to the client.
            log: false, // If true, errors will be logged to a file.
        }
    },
    database: { // Settings for Modelar.
        type: "mysql",
        host: "localhost",
        port: 3306,
        database: "cool-node",
        user: "root",
        password: ""
    },
    session: { // Settings for Express-Session.
        secret: "cool-node",
        name: "nsid",
        resave: true,
        saveUninitialized: true,
        secure: true,
        unset: "destroy",
        store: new MemoryStore({
            checkPeriod: 86400000 // 24h.
        })
    },
    view: { // Settings for EJS.
        delimiter: "%",
    },
    mail: { // Settings for Nodemailer.
        pool: false,
        host: "",
        port: 25,
        secure: false,
        from: "",
        auth: {
            type: "login",
            user: "",
            pass: ""
        }
    }
};