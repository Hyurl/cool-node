const DB = require("modelar/DB");

module.exports = (app) => {
    app.use((req, res, next) => {
        var db;
        Object.defineProperty(req, "db", {
            set: (v) => {},
            get: () => {
                if (db === undefined) {
                    db = new DB(config.database);
                    //When the response has been sent, recycle the database 
                    //connection.
                    res.on("finish", () => {
                        db.recycle();
                    });
                }
                return db;
            }
        });
        next();
    });
};