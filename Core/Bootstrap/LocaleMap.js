const fs = require("fs");
const path = require("path");
const SubdomainMap = require("./SubdomainMap");

var Locales = {};

for (let subdomain in SubdomainMap) {
    if (!Locales[subdomain])
        Locales[subdomain] = {};
    let dir = SubdomainMap[subdomain] + "/Locales";
    if (fs.existsSync(dir)) {
        let files = fs.readdirSync(dir);
        for (let file of files) {
            let extname = path.extname(file);
            if (extname == ".js" || extname == ".json") {
                let name = file.substring(0, file.indexOf(".")).toLowerCase(),
                    lang = require(dir + "/" + file);
                if (lang instanceof Array) {
                    let _lang = {};
                    for (let v of lang) {
                        _lang[v] = v;
                    }
                    Locales[subdomain][name] = _lang;
                } else {
                    Locales[subdomain][name] = lang;
                }
            }
        }
    }
}

module.exports = Locales;