module.exports = (app) => {
    app.use((req, res, next) => {
        var index = req.hostname && req.hostname.indexOf(config.server.host) - 1;
        if (index > 0) {
            req.subdomain = req.hostname.substring(0, index);
        } else {
            req.subdomain = "www";
        }
        next();
    });
};