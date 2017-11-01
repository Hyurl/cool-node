const ControllerMap = require("./ControllerMap");
const SocketController = require("../Controllers/SocketController");

var SocketControllerMap = {};

function walkPrototypeChain(proto, controllers, name, subdomain, depth = 0) {
    if (proto instanceof SocketController) {
        var _proto = !depth ? proto : proto.__proto__,
            props = Object.getOwnPropertyNames(_proto);
        for (let prop of props) {
            if (prop != "constructor" && prop.indexOf("_") !== 0 &&
                (proto[prop] instanceof Function)) {
                if (!SocketControllerMap[subdomain]) {
                    SocketControllerMap[subdomain] = {};
                }
                var event = name + "/" + prop;
                if (!SocketControllerMap[subdomain][event]) {
                    SocketControllerMap[subdomain][event] = {
                        Class: controllers[name],
                        method: prop
                    };
                }
            }
        }
        walkPrototypeChain(_proto, controllers, name, subdomain, depth += 1);
    }
}

// Get all socket controllers.
for (let subdomain in ControllerMap) {
    let controllers = ControllerMap[subdomain]["socket"];
    for (let name in controllers) {
        let proto = controllers[name].prototype
        walkPrototypeChain(proto, controllers, name, subdomain);
    }
}

module.exports = SocketControllerMap;