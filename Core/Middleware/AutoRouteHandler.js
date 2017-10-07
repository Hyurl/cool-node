const path = require("path");
const fs = require("fs");
const xml2js = require("xml2js");
const Controller = require("../Controllers/Controller");
const HttpControllerMap = {};
const Types = ["connect", "delete", "get", "head", "options", "patch", "post", "put", "trace"];

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
                } else if(RESTfulMap[prop]) {
                    type = RESTfulMap[prop];
                } else {
                    for (let _type of Types) {
                        if (prop.indexOf(_type) === 0){
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

function getParams(uri, depth){
    var params = {};
        uriArr = uri.split("/");
    uriArr.splice(0, depth);
    for (let i = 0; i < uriArr.length; i += 2) {
        let key = uriArr[i],
            value = uriArr[i+1];
        params[key] = isNaN(value) ? value : Number(value);
    }
    return params;
}

function getHttpController(subdomain, type, uri, method = "", origin = null, depth = null){
    if (!HttpControllerMap[subdomain] || Object.keys(HttpControllerMap[subdomain]).length < 1) {
        // If no controller presents, throw 404 error.
        throw new Error("404 Not Found!");
    }
    if (!uri){
        uri = "Home";
    }
    if(depth === null){ // Initiate.
        origin = uri;
        depth = uri.split("/").length;
    }
    var controller = HttpControllerMap[subdomain][uri];
    if (controller) { // Controller exists.
        if (method && controller.methods[method] !== undefined) {
            if (controller.methods[method] != type) {
                // If request method not matching, throw 405 error.
                throw new Error("405 Method Not Allowed!");
            } else {
                return {
                    name: uri,
                    Class: controller.Class,
                    method: type.toLowerCase() + method,
                    params: getParams(origin, depth + 1),
                    view: uri == "Home" ? method : `${uri}/${method}`,
                };
            }
        } else {
            if (type == "GET" && controller.methods.index == type) {
                // Call index() method.
                return {
                    name: uri,
                    Class: controller.Class,
                    method: "index",
                    params: getParams(origin, depth),
                    view: uri == "Home" ? "index" : `${uri}/index`,
                };
            } else {
                for (var method in controller.RESTfulMap) {
                    if (type == controller.RESTfulMap[method] && controller.methods[method]) {
                        // Call a RESTful method.
                        return {
                            name: uri,
                            Class: controller.Class,
                            method,
                            params: getParams(origin, depth),
                            view: uri == "Home" ? method : `${uri}/${method}`,
                        }
                    }
                }
                // If request method not matching, throw 405 error.
                throw new Error("405 Method Not Allowed!");
            }
        }
    } else { // No controller matched, try testing recursively.
        var uriArr = uri.split("/"),
            _method = uriArr.pop(),
            uri = uriArr.join("/");
        return getHttpController(subdomain, type, uri, _method, origin, depth -= 1);
    }
}

module.exports = (app) => {
    // Listen all URL at base level.
    app.all("*", (req, res) => {
        var subdomain = req.subdomain,
            uri = req.url.substring(1).split("?")[0];
        if (uri == "Home" || uri.indexOf("Home/") === 0){
            res.redirect(301, req.url.replace("/Home", "") || "/");
        }
        // Handle the procedure in a Promise context.
        new Promise((resolve, reject) => {
            try {
                if (uri == "favicon.ico") // Filter favicon.
                    throw new Error("404 Not Found!");
                var { name, Class, method, params, view } = getHttpController(subdomain, req.method, uri),
                    instance = new Class({
                        viewPath: subdomain == "www" ? "App/Views" : `App.${subdomain}/Views`,
                        defaultView: view
                    }, req);
                if (instance.requireAuth && !instance.authorized) {
                    if (instance.fallbackTo)
                        res.location(instance.fallbackTo);
                    else
                        throw new Error("401 Unauthorized!");
                }
                req.params = params;
                resolve(instance[method](req, res));
            } catch (err) {
                reject(err);
            }
        }).then(data => {
            if (!res.headersSent && data !== undefined) {
                var contentType = res.get("Content-Type");
                // Send data to the client.
                if (typeof data == "string" || data instanceof Buffer) {
                    res.send(data);
                } else if (typeof data == "object" && contentType && contentType.indexOf("text/xml") > -1) {
                    res.sendAsXML(data);
                } else if (typeof data != "function") {
                    res.json(data);
                } else {
                    throw new Error("500 Internal Server Error!");
                }
            }
        }).catch(err => {
            var code = parseInt(err.message) || 500;
            // Try to load the error page, if not present, then show the error 
            // message.
            (new Controller({
                viewPath: subdomain == "www" ? "App/Views" : `App.${subdomain}/Views`,
            })).view(code).then(content => {
                res.status(code).send(content);
            }).catch(_err => {
                res.status(code).send(err.message);
            });
        });
    });
};