const path = require("path");
const fs = require("fs");

if (!global.ROOT) {
    // Get the root directory of the project.
    var index = module.filename && module.filename.indexOf("node_modules"),
        dirname;
    if (module.parent && module.parent.filename) {
        dirname = path.dirname(module.parent.filename);
    } else if (index > 0) {
        dirname = module.filename.substring(0, index - 1);
    } else {
        dirname = __dirname;
    }

    // Root directory of the project.
    global.ROOT = path.normalize(dirname).replace(/\\/g, "/");
}

// pre-defined configurations of the project.
global.config = require("cool-node/config");

if (fs.existsSync(ROOT + "/config.js")) {
    // Load user-defined configurations.
    var config = require(ROOT + "/config.js");
    global.config = Object.assign({}, global.config, config);
}

module.exports = require("cool-node/Core/Bootstrap");