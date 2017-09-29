const HttpController = require("../Controllers/HttpController");

module.exports = (app) => {
    //Handle website home page.
    app.get("/", (req, res) => {
        new Promise((resolve, reject) => {
            try {
                var index = req.hostname.indexOf(config.server.host),
                    subdomain = "www";
                if (index > 0) {
                    subdomain = req.hostname.substring(0, index - 1);
                }
                if (ControllerMap[subdomain] &&
                    ControllerMap[subdomain].Home &&
                    ControllerMap[subdomain].Home.prototype instanceof HttpController) {
                    var instance = new ControllerMap[subdomain].Home({
                        viewPath: subdomain == "www" ? "App/Views" : `App.${subdomain}/Views`,
                        defaultView: "index"
                    });
                    if (instance.requireAuth && !req.user) {
                        if (instance.fallbackTo)
                            res.location(instance.fallbackTo);
                        else
                            throw new Error("401 Unauthorized!");
                    }
                    resolve(instance.index(req, res));
                } else {
                    //If no controller presents, or the matched controller is not a HttpController, throw 404 error.
                    throw new Error("404 Not Found!");
                }
            } catch (err) {
                reject(err);
            }
        }).then(data => {
            if (!res.headersSent) {
                typeof result == "object" ? res.json(data) : res.send(data);
            }
        }).catch(err => {
            var code = parseInt(err.message) || 500,
                controller = new HttpController;
            //Try to load the error page, if not present, just show the error 
            //message instead.
            controller.view(code).then(content => {
                res.status(code).send(content);
            }).catch(_err => {
                res.status(code).send(err.message);
            });
        });
    });
}