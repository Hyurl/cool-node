const bodyParser = require('body-parser');
const xml2js = require("xml2js");

module.exports = (app) => {
    app.use(bodyParser.text({
        type: (req) => {
            // Parse plain/XML.
            var converts = ["plain", "xml"],
                type = req.headers['content-type'];
            type = type && type.match(/text\/(\S+)\b/)[1];
            return converts.includes(type);
        }
    })).use((req, res, next) => {
        // Add a method on response object, used for sending XML to the client.
        res.sendAsXML = (data) => {
            if (typeof data == "object") {
                res.setHeader("Content-Type", "text/xml; charset=utf-8");
                var builder = new xml2js.Builder({ cdata: true });
                res.send(builder.buildObject(data));
            } else {
                res.end();
            }
        };
        // Parse XML request body.
        var type = req.headers['content-type']
        if (type && type.indexOf("text/xml") > -1) {
            xml2js.parseString(req.body, {
                ignoreAttrs: true,
                async: true,
                explicitArray: false,
            }, (err, result) => {
                if (!err) {
                    req.body = result;
                } else {
                    console.log(err);
                }
                next();
            });
        } else {
            next();
        }
    });
};