const fs = require("fs");
const path = require("path");
const CHARS = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";

/** 
 * Makes a string's first char upper-cased.
 * @param {String} text The original string.
 */
function ucfirst(text) {
    return text[0].toUpperCase() + text.substring(1);
}

/** 
 * Generates a random integer.
 * @param {Number} min The minimum number.
 * @param {Number} max The maximum number (inclusive).
 */
function rand(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

/** 
 * Generates a random string.
 * @param {Number} length The string length.
 * @param {String} chars The possible characters.
 */
function randStr(length = 5, chars = "") {
    chars = chars || CHARS;
    var str = "",
        max = chars.length - 1;
    for (var i = 0; i < length; i++) {
        str += chars[rand(0, max)];
    }
    return str;
}

/** 
 * Copies a directory/file to a new location synchronously.
 * @param {String} src The original path.
 * @param {String} dst The destination path.
 */
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

/** 
 * Makes directory recursively.
 * @param {String} dir The directory path.
 * @param {Number} mode Default is 0o777.
 */
function xmkdir(dir, mode = 0o777) {
    dir = path.normalize(dir).replace(/\\/g, "/").split("/");
    var _dir = [];
    for (var i = 0; i < dir.length; i++) {
        _dir.push(dir[i]);
        let dirname = _dir.join("/");
        if (dirname && !fs.existsSync(dirname)) {
            fs.mkdirSync(dirname, mode);
        }
    }
}

/** 
 * Gets a file's next filename when the file exists.
 * @param {String} filename The original filename.
 * @param {String} extname Set a specified extension name.
 */
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

/** 
 * Escape HTML tags.
 * @param {String} html HTML contents.
 * @param {String|Array} tags Escape specified tags, default is 
 *  <script><style><iframe><object><embed>.
 * @return {String} Escaped HTML contents.
 */
function escapeTags(html, tags = "<script><style><iframe><object><embed>") {
    tags = Array.isArray(tags) ? tags : tags.match(/[a-zA-Z0-9\-:]+/g);
    for (let tag of tags) {
        let re1 = new RegExp(`<${tag}\\s*>`, "gi"),
            re2 = new RegExp(`<\\/${tag}\\s*>`, "gi"),
            re3 = new RegExp(`<${tag}(.*)>`, "gi");
        html = html.replace(re1, `&lt;${tag}&gt;`)
            .replace(re2, `&lt;/${tag}&gt;`)
            .replace(re3, match => {
                return "&lt;" + match.substring(1, match.length - 1) + "&gt;";
            });
    }
    return html;
}

/**
 * Escape JavaScript Hrefs.
 * @param {String} html HTML contents.
 * @return {String} Escaped HTML contents.
 */
function escapeScriptHrefs(html) {
    return html.replace(/\shref\s*=["'\s]*javascript:/gi, match => {
        return match.replace("href", "data-href");
    });
}

/** 
 * Escape event attributes.
 * @param {String} html HTML contents.
 * @return {String} Escaped HTML contents.
 */
function escapeEventAttributes(html) {
    return html.replace(/\son[a-z]+\s*=/gi, match => {
        return " data-" + match.substring(1);
    });
}

/** 
 * Inject CSRF Token into forms.
 * @param {String} html HTML contents.
 * @param {String} token The CSRF token.
 * @return {String} HTML contents with CSRF token in forms.
 */
function injectCsrfToken(html, token) {
    var ele = `<input type="hidden" name="x-csrf-token" value="${token}">`,
        matches = html.match(/<form .*>/g);
    if (matches) {
        for (let match of matches) {
            let i = html.indexOf(match) + match.length,
                j = html.indexOf("<", i),
                spaces = html.substring(i, j);
            html = html.substring(0, i) + spaces + ele + html.substring(i);
        }
    }
    return html;
}

module.exports = {
    ucfirst,
    rand,
    randStr,
    xcopy,
    xmkdir,
    nextFilename,
    escapeTags,
    escapeScriptHrefs,
    escapeEventAttributes,
    injectCsrfToken
};