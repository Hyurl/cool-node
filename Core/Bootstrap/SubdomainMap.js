const fs = require("fs");

var SubdomainMap = {};
var files = fs.readdirSync(ROOT);

for (let file of files) {
    let stat = fs.statSync(ROOT + "/" + file);
    if (stat.isDirectory()) {
        if (file == "App") {
            SubdomainMap.www = ROOT + "/" + file;
        } else if (match = file.match(/App\.(\S+)/)) {
            SubdomainMap[match[1]] = ROOT + "/" + file;
        }
    }
}

module.exports = SubdomainMap;