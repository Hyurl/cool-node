const fs = require("fs");
const path = require("path");

module.exports = (app) => {
    var dir = __dirname + "/http/";
    if (fs.existsSync(dir)) {
        var files = fs.readdirSync(dir);
        for (let file of files) {
            file = dir + file;
            let stat = fs.statSync(file);
            if (stat.isFile() && path.extname(file) == ".js") {
                require(file)(app);
            }
        }
    } else {
        fs.mkdirSync(dir);
    }
};