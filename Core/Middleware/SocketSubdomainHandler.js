module.exports = (io) => {
    io.use((socket, next) => {
        if (socket.hostname) {
            if (typeof config.server.host == "string") {
                var hosts = [config.server.host];
            } else {
                var hosts = config.server.host;
            }
            for (let host of hosts) {
                let index = socket.hostname.indexOf(host);
                if (index > 0) {
                    socket.subdomain = socket.hostname.substring(0, index - 1);
                    break;
                }
            }
        }
        socket.subdomain = socket.subdomain || "www";
        // Socket joins into the room of the subdomain.
        socket.join(socket.subdomain);
        next();
    });
};