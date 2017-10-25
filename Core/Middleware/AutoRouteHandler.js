const path = require("path");
const zlib = require("zlib");
const Controller = require("../Controllers/Controller");
const HttpControllerMap = require("../Bootstrap/HttpControllerMap");
const initConfig = require("../../config");

function getParams(uri, depth) {
    var params = {};
    uriArr = uri.split("/");
    uriArr.splice(0, depth);
    for (let i = 0; i < uriArr.length; i += 2) {
        let key = uriArr[i],
            value = uriArr[i + 1];
        params[key] = isNaN(value) ? value : Number(value);
    }
    return params;
}

function getHttpController(subdomain, type, uri, method = "", origin = null, depth = null) {
    if (!HttpControllerMap[subdomain] || Object.keys(HttpControllerMap[subdomain]).length < 1) {
        // If no controller presents, throw 404 error.
        throw new Error("404 Not Found!");
    }
    if (!uri) {
        uri = "Home";
    }
    if (depth === null) { // Initiate.
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
                var _method = method;
                if (!(method in controller.RESTfulMap) && method != "index")
                    method = type.toLowerCase() + method;
                return {
                    name: uri,
                    Class: controller.Class,
                    method,
                    params: getParams(origin, depth + 1),
                    view: uri == "Home" ? method : `${uri}/${_method}`,
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
                var reverseMap = {};
                for (var method in controller.RESTfulMap) {
                    reverseMap[controller.RESTfulMap[method]] = method;
                }
                if (!reverseMap[type]) {
                    throw new Error("405 Method Not Allowed!");
                } else if (!controller.methods[reverseMap[type]]) {
                    throw new Error("404 Not Found!");
                } else {
                    // Call a RESTful method.
                    return {
                        name: uri,
                        Class: controller.Class,
                        method: reverseMap[type],
                        params: getParams(origin, depth),
                        view: uri == "Home" ? method : `${uri}/${method}`,
                    }
                }
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
        res.gzip = false;
        var _url = path.normalize(req.url).replace(/\\\\|\\/g, "/"),
            _path = path.normalize(req.path).replace(/\\\\|\\/g, "/"),
            subdomain = req.subdomain,
            uri = _path.substring(1);
        if (uri == "Home" || uri.indexOf("Home/") === 0) {
            res.redirect(301, _url.replace("/Home", "") || "/");
        }
        // Handle the procedure in a Promise context.
        new Promise((resolve, reject) => {
            try {
                // Throw 404 if the URL is invalid.
                var ext = path.extname(uri),
                    strictURL = config.server.strictURL || initConfig.server.strictURL;
                if (ext && strictURL.enabled && !strictURL.exception.includes(ext)) {
                    throw new Error("404 Not Found!");
                }
                var { name, Class, method, params, view } = getHttpController(subdomain, req.method, uri),
                    options = {
                        viewPath: subdomain == "www" ? "App/Views" : `App.${subdomain}/Views`,
                        defaultView: view,
                        action: name + "." + method,
                        actionName: method
                    };
                req.params = params;

                function next(instance) {
                    instance = instance || this;
                    if (instance.requireAuth && !instance.authorized) {
                        if (instance.fallbackTo) {
                            res.redirect(302, instance.fallbackTo);
                            return;
                        } else {
                            throw new Error("401 Unauthorized!");
                        }
                    }
                    var encoding = req.headers["accept-encoding"].split(",")[0];
                    if (encoding == "gzip" && instance.gzip) {
                        res.gzip = true;
                    }
                    resolve(instance[method](req, res));
                }

                if (Class.prototype.constructor.length === 4) {
                    new Class(options, req, res, next);
                } else {
                    var instance = new Class(options, req, res);
                    next(instance);
                }
            } catch (err) {
                reject(err);
            }
        }).then(data => {
            if (!res.headersSent) {
                var type = res.get("Content-Type"),
                    xml = /(text|application)\/xml\b/;
                if (xml.test(type)) {
                    res.xml(data);
                } else {
                    // Send data to the client.
                    if (data === null || data === undefined) {
                        res.end();
                    } else if (typeof data == "string") {
                        if (res.gzip) {
                            // Send compressed data.
                            data = zlib.gzipSync(data);
                            res.set("Content-Encoding", "gzip");
                            res.set("Content-Length", Buffer.byteLength(data));
                            res.end(data);
                        } else {
                            res.send(data);
                        }
                    } else if (data instanceof Buffer) {
                        res.send(data);
                    } else if (typeof data != "function") {
                        res.json(data);
                    } else {
                        throw new Error("500 Internal Server Error!");
                    }
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