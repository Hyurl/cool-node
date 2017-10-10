const bodyParser = require('body-parser');
const xml2js = require("xml2js");

var plain = /text\/plain\b/,
    xml = /(text|application)\/xml\b/,
    builder = new xml2js.Builder({ cdata: true });

module.exports = (app) => {
    app.use(bodyParser.text({
        type: (req) => {
            // Parse plain/XML.
            var type = req.headers['content-type'];
            return plain.test(type) || xml.test(type);
        }
    })).use((req, res, next) => {
        // Add a method on response object, used for sending XML to the client.
        res.xml = (data) => {
            if (!res.get("Content-Type")) {
                res.type("xml");
            }
            if (data !== null && data !== undefined) {
                if (data[0] != "<" && data[data.length - 1] != ">") {
                    res.send(builder.buildObject(data));
                } else {
                    res.send(data);
                }
            } else {
                res.end();
            }
        };
        // Parse XML request body.
        if (xml.test(req.headers['content-type'])) {
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