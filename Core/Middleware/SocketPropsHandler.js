module.exports = (io) => {
    io.use((socket, next) => {
        // Get protocol.
        socket.protocol = socket.request.protocol == "https" ? "wss" : "ws";

        // Get hostname.
        var host = socket.request.headers.host,
            proxyHost = socket.request.headers["x-forwarded-host"];
        host = proxyHost || host;
        if (host) {
            // IPv6 literal support
            var offset = host[0] === '[' ? host.indexOf(']') + 1 : 0;
            var index = host.indexOf(':', offset);

            socket.hostname = index !== -1 ? host.substring(0, index) : host;
        }

        // Get IP/IPs.
        var addr = socket.handshake.address,
            proxyIps = socket.request.headers["x-forwarded-host"],
            clientIp = socket.request.headers["client-ip"];
        if (proxyIps) {
            socket.ip = clientIp || proxyIps[0];
            socket.ips = proxyIps;
        } else {
            socket.ip = addr;
            socket.ips = [addr];
        }

        // Get others.
        socket.secure = socket.handshake.secure;

        next();
    });
}