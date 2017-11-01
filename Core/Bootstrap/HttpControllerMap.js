const ControllerMap = require("./ControllerMap");
const HttpController = require("../Controllers/HttpController");

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

function walkPrototypeChain(proto, methods, RESTfulMap, depth = 0) {
    if (proto instanceof HttpController) {
        var _proto = !depth ? proto : proto.__proto__,
            props = Object.getOwnPropertyNames(_proto);
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
                if (type) {
                    if (!methods[prop]) {
                        methods[prop] = type;
                    } else if (!Array.isArray(methods[prop]) && methods[prop] != type) {
                        methods[prop] = [methods[prop], type];
                    } else if (Array.isArray(methods[prop]) && !methods[prop].includes(type)) {
                        methods[prop].push(type);
                    }
                }
            }
        }
        walkPrototypeChain(_proto, methods, RESTfulMap, depth += 1);
    }
}

// Get all HTTP controllers.
for (let subdomain in ControllerMap) {
    let controllers = ControllerMap[subdomain]["http"];
    for (let name in controllers) {
        if (!HttpControllerMap[subdomain])
            HttpControllerMap[subdomain] = {};
        let methods = {},
            RESTfulMap = controllers[name].prototype.RESTfulMap;
        walkPrototypeChain(controllers[name].prototype, methods, RESTfulMap);
        HttpControllerMap[subdomain][name] = {
            Class: controllers[name],
            methods,
            RESTfulMap
        };
    }
}

module.exports = HttpControllerMap;