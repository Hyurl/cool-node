const DB = require("modelar/DB");

module.exports = (app) => {
    app.use((req, res, next) => {
        var db;
        Object.defineProperty(req, "db", {
            set: (v) => {
                db = v;
                //When the response has been sent, recycle the database 
                //connection.
                res.on("finish", () => {
                    db.recycle();
                });
            },
            get: () => {
                if (db === undefined) {
                    req.db = new DB(config.database);
                }
                return db;
            }
        });
        next();
    });
};