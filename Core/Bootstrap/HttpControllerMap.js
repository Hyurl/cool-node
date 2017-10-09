const ControllerMap = require("./ControllerMap");

var HttpControllerMap = {};
var Types = [
    "connect",
    "delete",
    "get",
    "head",
    "options",
    "patch",
    "post",
    "put",
    "trace"
];

// Get all HTTP controllers.
for (let subdomain in ControllerMap) {
    let controllers = ControllerMap[subdomain]["http"];
    for (let name in controllers) {
        if (!HttpControllerMap[subdomain])
            HttpControllerMap[subdomain] = {};
        let proto = controllers[name].prototype,
            props = Object.getOwnPropertyNames(proto),
            methods = {},
            instance = new controllers[name],
            RESTfulMap = instance.RESTfulMap;
        for (let prop of props) {
            if (prop != "constructor" && (proto[prop] instanceof Function)) {
                let type;
                if (prop == "index") {
                    type = "GET";
                } else if (RESTfulMap[prop]) {
                    type = RESTfulMap[prop];
                } else {
                    for (let _type of Types) {
                        if (prop.indexOf(_type) === 0) {
                            prop = prop.substring(_type.length);
                            type = _type.toUpperCase();
                            break;
                        }
                    }
                }
                if (type)
                    methods[prop] = type;
            }
        }
        HttpControllerMap[subdomain][name] = {
            Class: controllers[name],
            methods,
            RESTfulMap
        };
    }
}

module.exports = HttpControllerMap;