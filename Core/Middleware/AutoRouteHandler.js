const path = require("path");
const fs = require("fs");
const zlib = require("zlib");
const url = require("url");
const multer = require("multer");
const co = require("co");
const StringTrimmer = require("string-trimmer");
const Controller = require("../Controllers/Controller");
const HttpControllerMap = require("../Bootstrap/HttpControllerMap");
const initConfig = require("../../config");
const DateTime = require("../Tools/DateTime");
const { xmkdir, randStr, nextFilename } = require("../Tools/Functions");
const EFFECT_METHODS = ["DELETE", "PATCH", "POST", "PUT"];

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
            if (!Array.isArray(controller.methods[method])) {
                var types = [controller.methods[method]];
            } else {
                var types = controller.methods[method];
            }
            for (let _type of types) {
                if (_type == type) {
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
            }
            // If request method doesn't not match, throw 405 error.
            throw new Error("405 Method Not Allowed!");
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

function resolver(instance, method, req, res, resolve) {
    if (instance[method].constructor.name == "GeneratorFunction") {
        resolve(co(instance[method](req, res)));
    } else {
        resolve(instance[method](req, res));
    }
}

function csrfTokenHandler(instance, subdomain, req, res) {
    if (instance.csrfToken) {
        if (req.method == "GET") {
            // Define a setter to access and initiate CSRF token.
            Object.defineProperty(req, "csrfToken", {
                set: (v) => {},
                get: () => {
                    if (!req.__csrfToken) {
                        if (!req.session.csrfTokens) {
                            req.session.csrfTokens = {};
                        }
                        // Differ tokens by actions.

                        var tokens = req.session.csrfTokens,
                            token = randStr(64);
                        req.__csrfToken = tokens[instance.action] = token;
                        res.set("X-CSRF-Token", req.__csrfToken);
                    }
                    return req.__csrfToken;
                }
            });
        } else if (EFFECT_METHODS.includes(req.method)) {
            // Must send request header: referer. 
            if (!req.headers.referer) {
                throw new Error("403 Forbidden!");
            }
            var ref = req.headers.referer,
                uri = url.parse(ref).pathname.substring(1),
                // Parse referer and get old controller.
                _controller = getHttpController(subdomain, "GET", uri),
                action = _controller.name + "." + _controller.method,
                name = "x-csrf-token",
                tokens = req.session.csrfTokens,
                token = tokens && tokens[action];
            if (token === undefined ||
                req.headers[name] != token &&
                req.params[name] != token &&
                req.query[name] != token &&
                req.body[name] != token) {
                throw new Error("403 Forbidden!");
            } else {
                // Make a reference to the token.
                Object.defineProperty(req, "csrfToken", {
                    set: (v) => {
                        if (v === null || v === undefined)
                            delete tokens[action];
                    },
                    get: () => tokens[action]
                });
            }
        }
    }
}

function uploadHandler(instance, method, req, res, resolve, reject) {
    if (req.method == "POST" && instance.uploadConfig.fields.length) {
        var fields = [];
        for (let field of instance.uploadConfig.fields) {
            fields.push({
                name: field,
                maxCount: instance.uploadConfig.maxCount
            });
        }
        var date = (new DateTime).date,
            savePath = `${instance.uploadConfig.savePath}/${date}`,
            uploader = multer({
                preservePath: true,
                storage: multer.diskStorage({
                    destination: (req, file, cb) => {
                        try {
                            if (!fs.existsSync(savePath))
                                xmkdir(savePath);
                            cb(null, savePath);
                        } catch (e) {
                            reject(e);
                        }
                    },
                    filename: (req, file, cb) => {
                        try {
                            if (instance.uploadConfig.filename instanceof Function) {
                                var filename = instance.uploadConfig.filename(file);
                            } else if (instance.uploadConfig.filename === "random") {
                                var extname = path.extname(file.originalname),
                                    filename = randStr(32) + extname;
                            } else { // auto-increment
                                var nextname = nextFilename(`${savePath}/${file.originalname}`),
                                    filename = path.basename(nextname);
                            }
                            cb(null, filename);
                        } catch (e) {
                            reject(e);
                        }
                    }
                }),
                fileFilter: (req, file, cb) => {
                    try {
                        var pass = instance.uploadConfig.filter(file);
                        cb(null, pass);
                    } catch (err) {
                        reject(err);
                    }
                }
            }).fields(fields);
        uploader(req, res, (err) => {
            if (err) {
                reject(err);
            } else {
                resolver(instance, method, req, res, resolve);
            }
        });
    } else {
        resolver(instance, method, req, res, resolve);
    }
}

module.exports = (app) => {
    // Listen all URL at base level.
    app.all("*", (req, res) => {
        res.gzip = false;
        var _url = path.normalize(req.url).replace(/\\\\|\\/g, "/"),
            _path = path.normalize(req.path).replace(/\\\\|\\/g, "/"),
            subdomain = req.subdomain,
            uri = StringTrimmer.trim(_path, "/"), //_path.substring(1),
            options = null;
        if (uri == "Home" || uri.indexOf("Home/") === 0) {
            res.redirect(301, _url.replace("/Home", "") || "/");
        }
        // Handle the procedure in a Promise context.
        new Promise((resolve, reject) => {
            try {
                var { name, Class, method, params, view } = getHttpController(subdomain, req.method, uri);
                options = {
                    subdomain,
                    appPath: subdomain == "www" ? "App" : `App.${subdomain}`,
                    viewPath: subdomain == "www" ? "App/Views" : `App.${subdomain}/Views`,
                    defaultView: view,
                    action: name + "." + method,
                    actionName: method,
                    lang: req.query.lang || req.cookies.lang || req.lang
                };
                req.params = params;

                function next(instance) {
                    instance = instance || this;
                    // Handle authentication.
                    if (instance.requireAuth && !instance.authorized) {
                        if (instance.fallbackTo) {
                            res.redirect(302, instance.fallbackTo);
                            return;
                        } else {
                            throw new Error("401 Unauthorized!");
                        }
                    } else if (Array.isArray(instance.urlParams)) {
                        // Handle URL parameters.
                        for (let key in params) {
                            if (!instance.urlParams.includes(key)) {
                                options = null; // Reset options.
                                throw new Error("404 Not Found!");
                            }
                        }
                    }
                    // Handle CSRF token.
                    csrfTokenHandler(instance, subdomain, req, res);
                    // Handle GZip.
                    var encodings = req.headers["accept-encoding"],
                        encoding = encodings && encodings.split(",")[0];
                    if (encoding == "gzip" && instance.gzip) {
                        res.gzip = true;
                    }
                    // Handle jsonp.
                    if (req.method == "GET" && instance.jsonp && req.query[instance.jsonp]) {
                        res.jsonpCallback = req.query[instance.jsonp];
                    }
                    // Handle file uploading.
                    uploadHandler(instance, method, req, res, resolve, reject);
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
                    } else if (data instanceof Buffer) {
                        res.send(data);
                    } else if (typeof data != "function") {
                        if (res.jsonpCallback) {
                            var json = JSON.stringify(data);
                            res.set("Content-Type", "application/jsonp");
                            res.send(`${res.jsonpCallback}(${json});`);
                        } else if (typeof data == "string" && res.gzip) {
                            // Send compressed data.
                            data = zlib.gzipSync(data);
                            res.set("Content-Encoding", "gzip");
                            res.set("Content-Length", Buffer.byteLength(data));
                            res.end(data);
                        } else {
                            res.send(data);
                        }
                    } else {
                        throw new Error("500 Internal Server Error!");
                    }
                }
            } else if (!res.finished && data !== null && data !== undefined) {
                res.end(data);
            }
        }).catch(err => {
            var code = parseInt(err.message) || 500,
                accept = req.headers.accept && req.headers.accept.split(",")[0],
                stack = config.server.error && config.server.error.stack,
                log = config.server.error && config.server.error.log,
                error = stack ? err.stack : err.message;
            if (req.url.length > 64) {
                // If URL's length exceeds 64, cut down exceeding part.
                var url = req.url.substring(0, 61) + "...";
            } else {
                var url = req.url;
            }
            var controller = new Controller(options || {
                subdomain,
                appPath: subdomain == "www" ? "App" : `App.${subdomain}`,
                viewPath: subdomain == "www" ? "App/Views" : `App.${subdomain}/Views`,
                action: `${req.method} ${url}`,
                lang: req.lang
            });
            if (!stack && error.indexOf(`${code}: `) === 0) {
                // If error message is with the style '<code>: message', 
                // then cut out the real message.
                error = error.substring(`${code}: `.length);
            }
            if (accept == "application/json") {
                res.send(controller.error(error, code));
            } else if (res.jsonpCallback) {
                var json = JSON.stringify(controller.error(error, code));
                res.set("Content-Type", "application/jsonp");
                res.send(`${res.jsonpCallback}(${json});`);
            } else {
                // Try to load the error page, if not present, then show the 
                // error message.
                controller.view(code, { err }).then(content => {
                    res.status(code).send(content);
                }).catch(_err => {
                    if (stack) {
                        // Escape HTML tags.
                        error = error.replace(/<[a-zA-Z0-9]+\b/g, match => {
                            return "&lt;" + match.substring(1);
                        }).replace(/\b[a-zA-Z0-9]+>/g, match => {
                            return match.substring(0, match.length - 1) + "&gt;";
                        });
                        error = `<pre>${error}</pre>`;
                    }
                    res.status(code).send(error);
                });
            }
            if (log) {
                // Log the error to a file.
                controller.logger.warn(error);
            }
        });
    });
};