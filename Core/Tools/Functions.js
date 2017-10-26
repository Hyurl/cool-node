const fs = require("fs");
const path = require("path");

/** Makes a string's first char upper-cased. */
function ucfirst(str) {
    return str[0].toUpperCase() + str.substring(1);
}

/** Copys a directory to a new location. */
function xcopy(src, dst) {
    var stat = fs.statSync(src),
        dir = path.dirname(dst);
    if (!fs.existsSync(dir)) {
        xmkdir(dir);
    }
    if (stat.isDirectory()) {
        var files = fs.readdirSync(src);
        for (let file of files) {
            xcopy(`${src}/${file}`, `${dst}/${file}`);
        }
    } else {
        var input = fs.createReadStream(src),
            output = fs.createWriteStream(dst);
        input.pipe(output);
    }
}

/** Makes directory recursively. */
function xmkdir(dir) {
    dir = path.normalize(dir).replace(/\\/g, "/").split("/");
    var _dir = [];
    for (var i = 0; i < dir.length; i++) {
        _dir.push(dir[i]);
        let dirname = _dir.join("/");
        if (dirname && !fs.existsSync(dirname)) {
            fs.mkdirSync(dirname);
        }
    }
}

module.exports = { ucfirst, xcopy, xmkdir };