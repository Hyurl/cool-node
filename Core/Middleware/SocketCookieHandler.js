module.exports = (io, parser) => {
    // Socket.io middleware for handling cookies.
    io.use((socket, next) => {
        // Parse cookies.
        parser(socket.handshake, {}, next);
    }).use((socket, next) => {
        socket.cookies = socket.handshake.cookies;
        next();
    });
};