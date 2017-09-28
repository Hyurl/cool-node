const fs = require("fs");

module.exports = (io) => {
    var files = fs.readdirSync(__dirname + "/socket");
    for (let file of files) {
        file = __dirname + "/socket/" + file;
        let stat = fs.statSync(file);
        if (stat.isFile()) {
            require(file)(io);
        }
    }
}