const DB = require("modelar/DB");

module.exports = (io) => {
    io.use((socket, next) => {
        var db;
        Object.defineProperty(socket, "db", {
            set: (v) => {},
            get: () => {
                if (db === undefined) {
                    db = new DB(config.database);
                    //When the socket is disconnected, recycle the database 
                    //connection.
                    socket.on("disconnected", () => {
                        db.recycle();
                    });
                }
                return db;
            }
        });
        next();
    });
}