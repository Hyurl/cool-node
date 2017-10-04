module.exports = (app) => {
    if (config.server.https.port && config.server.https.forceRedirect) {
        app.use((req, res, next) => {
            if (req.protocol != "https") {
                var host = req.headers.host.replace(/:\d+/, ":" + config.server.https.port);
                res.redirect(301, `https://${host}${req.url}`);
            } else {
                next();
            }
        });
    }
};