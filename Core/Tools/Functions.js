const fs = require("fs");
const path = require("path");
const CHARS = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";

/** Makes a string's first char upper-cased. */
function ucfirst(str) {
    return str[0].toUpperCase() + str.substring(1);
}

/** Generate a random integer. */
function rand(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

/** Generate a random string */
function randStr(length = 5, chars = "") {
    chars = chars || CHARS;
    var str = "",
        max = chars.length - 1;
    for (var i = 0; i < length; i++) {
        str += chars[rand(0, max)];
    }
    return str;
}

/** Copies a directory to a new location. */
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

/** Gets a file's next filename when the file exists. */
function nextFilename(filename, extname = "") {
    if (!fs.existsSync(filename)) {
        return filename;
    } else {
        var dir = path.dirname(filename),
            extname = extname || path.extname(filename),
            basename = path.basename(filename, extname),
            files = fs.readdirSync(dir),
            lastNum = 0;
        for (let file of files) {
            let start = basename + " (",
                i = file.indexOf(start),
                j = file.lastIndexOf(")" + extname);
            if (i === 0 && j === (file.length - extname.length - 1)) {
                let num = file.substring(start.length, j);
                if (!isNaN(num)) {
                    lastNum = num;
                }
            }
        }
        var nextNum = parseInt(lastNum) + 1;
        return `${dir}/${basename} (${nextNum})${extname}`;
    }
}

module.exports = { ucfirst, rand, randStr, xcopy, xmkdir, nextFilename };