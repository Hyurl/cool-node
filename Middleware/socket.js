const fs = require("fs");

module.exports = (io) => {
    var path = __dirname + "/socket";
    if (fs.existsSync(path)) {
        var files = fs.readdirSync(path);
        for (let file of files) {
            file = path + file;
            let stat = fs.statSync(file);
            if (stat.isFile()) {
                require(file)(io);
            }
        }
    } else {
        fs.mkdirSync(path);
    }
};