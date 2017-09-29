const path = require("path");
const fs = require("fs");
const HttpController = require("../Controllers/HttpController");

function getController(subdomain, type, URI, res, params = {}, URI2 = []) {
    if (!URI.length) {
        throw new Error("404 Not Found!");
    }
    URI2.push(URI.shift());
    var className = URI2.join("/");
    if (!ControllerMap[subdomain]) {
        //If no controller presents, throw 404 error.
        throw new Error("404 Not Found!");
    }
    if (ControllerMap[subdomain][className]) { //Class exists.
        if (!(ControllerMap[subdomain][className].prototype instanceof HttpController)) {
            //If the matched controller is not a HttpController, throw 404 error.
            throw new Error("404 Not Found!");
        }
        if (className == "Home") {
            res.redirect(301, "/");
            return false;
        }
        var instance = new ControllerMap[subdomain][className]({
                viewPath: subdomain == "www" ? "App/Views" : `App.${subdomain}/Views`
            }),
            methodName1 = URI[0];
        if (methodName1 === undefined) {
            //If only the class name is specified, then try to call index().
            if (instance.index instanceof Function) {
                if (type == "GET") {
                    instance.defaultView = className + "/index";
                    return { instance, methodName: "index", params };
                } else {
                    throw new Error("405 Method Not Allowed!");
                }
            } else {
                //If index() is not defined, try to call RESTful methods.
                for (let key in instance.RESTfulMap) {
                    if (instance.RESTfulMap[key] == type && instance[key] instanceof Function) {
                        for (let i = 0; i < URI.length; i += 2) {
                            params[URI[i]] = URI[i + 1] || "";
                        }
                        instance.defaultView = className + "/" + key;
                        return { instance, methodName: key, params };
                    }
                }
                throw new Error("404 Not Found!");
            }
        }
        var methodName2 = type.toLowerCase() + methodName1,
            inMap = instance.RESTfulMap[methodName1] !== undefined && instance[methodName1] instanceof Function,
            isMethod2 = instance[methodName2] instanceof Function;
        if (inMap || isMethod2) {
            //The rest parts (after class name and/or method name) of URI will
            //be seem as parameters.
            for (let i = 1; i < URI.length; i += 2) {
                params[URI[i]] = URI[i + 1] || "";
            }
            if (inMap) {
                //Methods in the RESTful map can be specified directly.
                if (instance.RESTfulMap[methodName1] == type) {
                    instance.defaultView = className + "/" + methodName1;
                    return { instance, methodName: methodName1, params };
                } else {
                    throw new Error("405 Method Not Allowed!");
                }
            } else {
                //Methods not in the RESTful map must specified without the 
                //request type.
                instance.defaultView = className + "/" + methodName1;
                return { instance, methodName: methodName2, params };
            }
        } else if (instance.index instanceof Function) {
            //If no methods are matched, then try to call index().
            if (type == "GET") {
                var start = methodName1 == "index" ? 1 : 0
                for (let i = start; i < URI.length; i += 2) {
                    params[URI[i]] = URI[i + 1] || "";
                }
                instance.defaultView = className + "/index";
                return { instance, methodName: "index", params };
            } else {
                throw new Error("405 Method Not Allowed!");
            }
        } else {
            //If no methods are specified, try to call RESTful methods.
            for (let key in instance.RESTfulMap) {
                if (instance.RESTfulMap[key] == type) {
                    for (let i = 0; i < URI.length; i += 2) {
                        params[URI[i]] = URI[i + 1] || "";
                    }
                    instance.defaultView = className + "/" + key;
                    return { instance, methodName: key, params };
                }
            }
            throw new Error("404 Not Found!");
        }
    } else { //Class doesn't exist, test recursively.
        return getController(subdomain, type, URI, res, params, URI2);
    }
}

module.exports = (app) => {
    //Listen all URL at base level.
    app.all("*", (req, res) => {
        //Handle the procedure in a Promise context.
        new Promise((resolve, reject) => {
            try {
                var type = req.method,
                    uri = req.url.substring(1),
                    index = req.hostname.indexOf(config.server.host),
                    subdomain = "www";
                if (index > 0) {
                    subdomain = req.hostname.substring(0, index - 1);
                }
                uri = path.normalize(uri).replace(/\\/g, "/");
                if (uri[uri.length - 1] == "/")
                    uri = uri.substring(0, uri.length - 1);
                var URI = uri.split("/"),
                    { instance, methodName, params } = getController(subdomain, type, URI, res);
                if (instance.requireAuth && !req.user) {
                    if (instance.fallbackTo)
                        res.location(instance.fallbackTo);
                    else
                        throw new Error("401 Unauthorized!");
                }
                req.params = params;
                resolve(instance[methodName](req, res));
            } catch (err) {
                reject(err);
            }
        }).then(data => {
            if (!res.headersSent) {
                //Send data to the client.
                typeof result == "object" ? res.json(data) : res.send(data);
            }
        }).catch(err => {
            var code = parseInt(err.message) || 500,
                controller = new HttpController;
            //Try to load the error page, if not present, just show the error 
            //message instead.
            controller.view(code).then(content => {
                res.status(code).send(content);
            }).catch(_err => {
                res.status(code).send(err.message);
            });
        });
    });
};