const fs = require("fs");

module.exports = (app) => {
    var files = fs.readdirSync(__dirname + "/http");
    for (let file of files) {
        file = __dirname + "/http/" + file;
        let stat = fs.statSync(file);
        if (stat.isFile()) {
            require(file)(app);
        }
    }
}