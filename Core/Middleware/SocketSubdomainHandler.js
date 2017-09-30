module.exports = (io) => {
    io.use((socket, next) => {
        var index = socket.request.headers.host.indexOf(config.server.host) - 1;
        if (index > 0) {
            socket.subdomain = socket.request.headers.host.substring(0, index);
        } else {
            socket.subdomain = "www";
        }
        next();
    });
};