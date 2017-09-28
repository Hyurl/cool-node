const session = require("express-session");
const MemoryStore = require('memorystore')(session);

module.exports = {
    server: {
        host: "localhost",
        port: 3000
    },
    database: {
        type: "mysql",
        host: "localhost",
        port: 3306,
        database: "cool-node",
        user: "root",
        password: ""
    },
    session: {
        secret: "cool-node",
        name: "nsid",
        resave: true,
        saveUninitialized: true,
        secure: true,
        unset: "destroy",
        store: new MemoryStore({
            checkPeriod: 86400000 // prune expired entries every 24h 
        })
    },
    mail: {
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
}