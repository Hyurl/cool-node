const HttpController = require("./HttpController");

/**
 * The Home controller is a special controller, it handles requests which 
 * visit the home page of the website through `GET /`.
 */
module.exports = class Home extends HttpController {
    /** GET / or GET /Home/ */
    index(req) {
        return this.view("index", {
            title: "Cool-Node",
            protocol: req.protocol,
            host: req.headers.host
        });
    }
}