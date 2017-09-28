const DB = require("modelar/DB");
const Connections = {};

module.exports = (io) => {
    io.use((socket, next) => {
        Object.defineProperty(socket, "db", {
            set: (v) => {},
            get: () => {
                if (Connections[socket.id] === undefined) {
                    Connections[socket.id] = new DB(config.database);
                    socket.on("disconnect", () => {
                        //If the socket connection is closed, recycle the database
                        //connection.
                        Connections[socket.id].recycle();
                        delete Connections[socket.id];
                    });
                }
                return Connections[socket.id];
            }
        });
        next();
    });
}