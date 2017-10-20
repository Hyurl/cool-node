module.exports = (app) => {
    app.use((req, res, next) => {
        if (req.hostname) {
            if (typeof config.server.host == "string") {
                var hosts = [config.server.host];
            } else {
                var hosts = config.server.host;
            }
            for (let host of hosts) {
                let index = req.hostname.indexOf(host);
                if (index > 0) {
                    req.subdomain = req.hostname.substring(0, index - 1);
                    break;
                }
            }
        }
        req.subdomain = req.subdomain || "www";
        next();
    });
};