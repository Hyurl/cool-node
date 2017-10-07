const URL = require("url");
const SocketControllerMap = {};

//Get all socket controllers.
for (let subdomain in ControllerMap) {
    let controllers = ControllerMap[subdomain]["socket"];
    for (let name in controllers) {
        let proto = controllers[name].prototype,
            props = Object.getOwnPropertyNames(proto);
        for (let prop of props) {
            if (prop != "constructor" && (proto[prop] instanceof Function)) {
                if (!SocketControllerMap[subdomain]) {
                    SocketControllerMap[subdomain] = [];
                }
                SocketControllerMap[subdomain].push({
                    event: name + "/" + prop,
                    Class: controllers[name],
                    method: prop
                });
            }
        }
    }
}

module.exports = (io) => {
    io.use((socket, next) => {
        var subdomain = socket.subdomain;
        if (!SocketControllerMap[subdomain]) {
            //If no controller presents, close the socket connection.
            return socket.disconnect(true);
        }
        //Bind all socket controllers to the events of underlying socket.
        for (let controller of SocketControllerMap[subdomain]) {
            let { event, Class, method } = controller;
            socket.on(event, (data) => {
                //Handle the procedure in a Promise context.
                new Promise((resolve, reject) => {
                    var instance = new Class({
                        viewPath: subdomain == "www" ? "App/Views" : `App.${subdomain}/Views`,
                        defaultView: event
                    }, socket);
                    if (instance.requireAuth && !instance.authorized) {
                        throw new Error("401 Unauthorized!");
                    }
                    resolve(instance[method](data, socket));
                }).then(_data => {
                    if (_data !== undefined) {
                        //Send data to the client.
                        socket.emit(event, _data);
                    }
                    //Recycle the database connection.
                    socket.db.recycle();
                }).catch(err => {
                    //If any error occurs, send a warning to the client.
                    socket.emit(event, {
                        success: false,
                        msg: err.message,
                        code: parseInt(err.message) || 500,
                    });
                    //Recycle the database connection.
                    socket.db.recycle();
                });
            });
        }
        next();
    });
};