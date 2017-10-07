const fs = require("fs");
const path = require("path");
const Controller = require("../Controllers/Controller");
const HttpController = require("../Controllers/HttpController");
const SocketController = require("../Controllers/SocketController");

const subdomainMap = {};
const ControllerMap = {};

var files = fs.readdirSync(ROOT);

for (let file of files) {
    var stat = fs.statSync(ROOT + "/" + file);
    if (stat.isDirectory()) {
        if (file == "App") {
            subdomainMap.www = ROOT + "/" + file;
        } else if (match = file.match(/App\.(\S+)/)) {
            subdomainMap[match[1]] = ROOT + "/" + file;
        }
    }
}

function loadControllers(subdomain, controllerPath) {
    var files = fs.readdirSync(controllerPath);
    for (let file of files) {
        let _file = controllerPath + "/" + file;
        let stat = fs.statSync(_file);
        if (stat.isFile() && path.extname(file) == ".js") {
            //If file is a js file, load it.
            var name = _file.substring(ROOT.length + 1);
            if (subdomain !== "www") {
                name = name.substring(`App.${subdomain}/Controllers/`.length);
            } else {
                name = name.substring(`App/Controllers/`.length);
            }
            var index = name.lastIndexOf(".");
            name = name.substring(0, index);
            let Class = require(_file);
            if (!ControllerMap[subdomain])
                ControllerMap[subdomain] = {};
            if (!ControllerMap[subdomain]["http"])
                ControllerMap[subdomain]["http"] = {};
            if (!ControllerMap[subdomain]["socket"])
                ControllerMap[subdomain]["socket"] = {};
            if (Class.prototype instanceof HttpController)
                ControllerMap[subdomain]["http"][name] = Class;
            else if (Class.prototype instanceof SocketController)
                ControllerMap[subdomain]["socket"][name] = Class;
        } else if (stat.isDirectory()) {
            //If file is a directory, call the function recursively.
            loadControllers(subdomain, _file);
        }
    }
}

for (let subdomain in subdomainMap) {
    loadControllers(subdomain, subdomainMap[subdomain] + "/Controllers");
}

global.ControllerMap = ControllerMap;