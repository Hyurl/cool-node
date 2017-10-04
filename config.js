const session = require("express-session");
const MemoryStore = require('memorystore')(session);

//Some of these settings are for their dependencies, you may check out all 
//supported options on their official websites.
module.exports = {
    server: {
        host: "localhost",
        port: 80,
        https: {
            port: 0, //If set, start a HTTPS server.
            forceRedirect: true, //If true, always redirect HTTP to HTTPS.
            credentials: { //You could use {pfx, passphrase} as well.
                key: "",
                cert: "",
            }
        }
    },
    database: { //Settings for Modelar.
        type: "mysql",
        host: "localhost",
        port: 3306,
        database: "cool-node",
        user: "root",
        password: ""
    },
    session: { //Settings for Express-Session.
        secret: "cool-node",
        name: "nsid",
        resave: true,
        saveUninitialized: true,
        secure: true,
        unset: "destroy",
        store: new MemoryStore({
            checkPeriod: 86400000 //24h.
        })
    },
    view: { //Settings for EJS.
        delimiter: "%",
    },
    mail: { //Settings for Nodemailer.
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