const path = require("path");
const co = require("co");
const Controller = require("../Controllers/Controller");
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
            let options = {
                subdomain,
                appPath: subdomain == "www" ? "App" : `App.${subdomain}`,
                viewPath: subdomain == "www" ? "App/Views" : `App.${subdomain}/Views`,
                defaultView: event,
                action: path.dirname(event) + "." + method,
                actionName: method,
                lang: socket.cookies.lang || socket.lang
            };
            socket.on(event, (...data) => {
                // Handle the procedure in a Promise context.
                new Promise((resolve, reject) => {
                    try {
                        function next(instance) {
                            instance = instance || this;
                            if (instance.requireAuth && !instance.authorized) {
                                throw new Error("401 Unauthorized!");
                            }
                            if (instance[method].constructor.name == "GeneratorFunction") {
                                resolve(co(instance[method](...data, socket)));
                            } else {
                                resolve(instance[method](...data, socket));
                            }
                        }

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
                    var code = parseInt(err.message) || 500,
                        stack = config.server.error && config.server.error.stack,
                        log = config.server.error && config.server.error.log,
                        error = stack ? err.stack : err.message,
                        _controller = new Controller(options);
                    if (!stack && error.indexOf(`${code}: `) === 0) {
                        // If error message is with the style 
                        // '<code>: message', then cut out the real message.
                        error = error.substring(`${code}: `.length);
                    }
                    socket.emit(event, _controller.error(error, code));
                    // Recycle the database connection.
                    socket.db.recycle();
                    if (log) {
                        // Log the error to a file.
                        _controller.logger.warn(error);
                    }
                });
            });
        }
        next();
    });
};