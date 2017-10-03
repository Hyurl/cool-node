const fs = require("fs");

module.exports = (app) => {
    var path = __dirname + "/http";
    if (fs.existsSync(path)) {
        var files = fs.readdirSync(path);
        for (let file of files) {
            file = path + file;
            let stat = fs.statSync(file);
            if (stat.isFile()) {
                require(file)(app);
            }
        }
    }
};