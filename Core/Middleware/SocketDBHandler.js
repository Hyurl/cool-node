const DB = require("modelar/DB");

module.exports = (io) => {
    io.use((socket, next) => {
        var db;
        Object.defineProperty(socket, "db", {
            set: (v) => {
                db = v;
                // When the socket is disconnected, recycle the database 
                // connection.
                socket.on("disconnected", () => {
                    db.recycle();
                });
            },
            get: () => {
                if (db === undefined) {
                    socket.db = new DB(config.database);
                }
                return db;
            }
        });
        next();
    });
}