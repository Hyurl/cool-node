const HttpController = require("./HttpController");

/**
 * The Home controller is a special controller, it handles requests which 
 * visit the home page of the website through `GET /`.
 */
module.exports = class Home extends HttpController {
    constructor(options, req, res) {
        super(options, req, res);
        // Empty `urlParams` means the Home controller doesn't accept any URL 
        // parameters.
        this.urlParams = [];
    }

    /** GET / */
    index(req) {
        return this.view("index", {
            title: "Cool-Node",
            protocol: req.protocol,
            host: req.headers.host
        });
    }
}