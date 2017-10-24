const path = require("path");
const SocketControllerMap = require("../Bootstrap/SocketControllerMap");

module.exports = (io) => {
    io.use((socket, next) => {
        var subdomain = socket.subdomain;
        if (!SocketControllerMap[subdomain]) {
            // If no controller presents, close the socket connection.
            return socket.disconnect(true);
        }
        // Bind all socket controllers to the events of underlying socket.
        for (let controller of SocketControllerMap[subdomain]) {
            let { event, Class, method } = controller;
            socket.on(event, (...data) => {
                // Handle the procedure in a Promise context.
                new Promise((resolve, reject) => {
                    try {
                        function next(instance) {
                            instance = instance || this;
                            if (instance.requireAuth && !instance.authorized) {
                                throw new Error("401 Unauthorized!");
                            }
                            resolve(instance[method](...data, socket));
                        }

                        var options = {
                            viewPath: subdomain == "www" ? "App/Views" : `App.${subdomain}/Views`,
                            defaultView: event,
                            action: path.dirname(event) + "." + method
                        };
                        if (Class.prototype.constructor.length === 3) {
                            new Class(options, socket, next);
                        } else {
                            var instance = new Class(options, socket);
                            next(instance);
                        }
                    } catch (err) {
                        reject(err);
                    }
                }).then(_data => {
                    if (_data !== undefined) {
                        // Send data to the client.
                        socket.emit(event, _data);
                    }
                    // Recycle the database connection.
                    socket.db.recycle();
                }).catch(err => {
                    // If any error occurs, send a warning to the client.
                    socket.emit(event, {
                        success: false,
                        code: parseInt(err.message) || 500,
                        error: err.message,
                        msg: err.message, // deprecated
                    });
                    // Recycle the database connection.
                    socket.db.recycle();
                });
            });
        }
        next();
    });
};