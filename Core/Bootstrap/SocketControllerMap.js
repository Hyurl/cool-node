const ControllerMap = require("./ControllerMap");

var SocketControllerMap = {};

// Get all socket controllers.
for (let subdomain in ControllerMap) {
    let controllers = ControllerMap[subdomain]["socket"];
    for (let name in controllers) {
        let proto = controllers[name].prototype,
            props = Object.getOwnPropertyNames(proto);
        for (let prop of props) {
            if (prop != "constructor" && prop.indexOf("_") !== 0 &&
                (proto[prop] instanceof Function)) {
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

module.exports = SocketControllerMap;