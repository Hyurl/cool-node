const URL = require("url");
const SocketController = require("../Controllers/SocketController");
const _ControllerMap = [];

//Get all socket controllers.
for (let subdomain in ControllerMap) {
    for (let name in ControllerMap[subdomain]) {
        let proto = ControllerMap[subdomain][name].prototype;
        if (proto instanceof SocketController) {
            let props = Object.getOwnPropertyNames(proto);
            for (let prop of props) {
                if (prop != "constructor" && (proto[prop] instanceof Function)) {
                    if (!_ControllerMap[subdomain]) {
                        _ControllerMap[subdomain] = [];
                    }
                    _ControllerMap[subdomain].push({
                        event: name + "/" + prop,
                        Class: ControllerMap[subdomain][name],
                        method: prop
                    });
                }
            }
        }
    }
}

module.exports = (io) => {
    io.use((socket, next) => {
        var index = socket.request.headers.host.indexOf(config.server.host);
        if (index === 0) {
            var subdomain = "www";
        } else if (index > 0) {
            var subdomain = socket.request.headers.host.substring(0, index - 1);
        } else {
            //If the subdomain isn't recognized, close the socket connection.
            return socket.disconnect(true);
        }
        if (!_ControllerMap[subdomain]) {
            //If no controller presents, close the socket connection.
            return socket.disconnect(true);
        }
        //Bind all socket controllers to the events of underlying socket.
        for (let controller of _ControllerMap[subdomain]) {
            let { event, Class, method } = controller;
            socket.on(event, (data) => {
                //Handle the procedure in a Promise context.
                new Promise((resolve, reject) => {
                    var instance = new Class;
                    if (instance.requireAuth && !socket.user) {
                        throw new Error("401 Unauthorized!");
                    }
                    resolve(instance[method](data, socket));
                }).then(_data => {
                    if (_data) {
                        //Send data to the client.
                        socket.emit(event, _data);
                    }
                }).catch(err => {
                    //If any error occurs, send a warning to the client.
                    socket.emit(event, {
                        success: false,
                        msg: err.message,
                        code: parseInt(err.message) || 500,
                    });
                });
            });
        }
        next();
    });
};