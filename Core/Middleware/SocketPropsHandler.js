const StringTrimmer = require("string-trimmer");

module.exports = (io) => {
    io.use((socket, next) => {
        var req = socket.request;
        // Get protocol.
        socket.protocol = req.protocol == "https" ? "wss" : "ws";

        // Get hostname.
        var host = req.headers.host,
            proxyHost = req.headers["x-forwarded-host"];
        host = proxyHost || host;
        if (host) {
            // IPv6 literal support
            var offset = host[0] === '[' ? host.indexOf(']') + 1 : 0;
            var index = host.indexOf(':', offset);

            socket.hostname = index !== -1 ? host.substring(0, index) : host;
        }

        // Get IP/IPs.
        var addr = socket.handshake.address,
            proxyIps = req.headers["x-forwarded-host"],
            clientIp = req.headers["client-ip"];
        if (proxyIps) {
            socket.ip = clientIp || proxyIps[0];
            socket.ips = proxyIps;
        } else {
            socket.ip = addr;
            socket.ips = [addr];
        }

        // Get languages.
        if (req.headers["accept-language"]) {
            var langs = req.headers["accept-language"].split(",");
            langs = langs.map(lang => {
                return StringTrimmer.trim(lang.split(";")[0]);
            });
            socket.lang = langs[0];
            socket.langs = langs;
        }

        // Get others.
        socket.secure = socket.handshake.secure;

        next();
    });
}