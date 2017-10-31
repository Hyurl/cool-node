const StringTrimmer = require("string-trimmer");

module.exports = (app) => {
    app.use((req, res, next) => {
        if (req.headers["accept-language"]) {
            var langs = req.headers["accept-language"].split(",");
            langs = langs.map(lang => {
                return StringTrimmer.trim(lang.split(";")[0]);
            });
            req.lang = langs[0];
            req.langs = langs;
        }
        next();
    });
};