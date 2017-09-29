const HttpController = require("./HttpController");

/**
 * The Home controller is a special controller, it handles requests which 
 * visit the home page of the website through `GET /`.
 */
module.exports = class Home extends HttpController {
    /** GET / or GET /Home/ */
    index() {
        return this.view("index", {
            title: "Cool-Node",
            host: req.headers.host
        });
    }
}