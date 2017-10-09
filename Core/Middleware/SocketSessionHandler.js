module.exports = (io, session) => {
    // Socket.io middleware for handling session.
    io.use((socket, next) => {
        // Parse session.
        session(socket.handshake, {}, next);
    }).use((socket, next) => {
        // Handle session in socket, including setting and getting.
        socket.session = new Proxy(socket.handshake.session, {
            set: (session, key, value) => {
                session[key] = value;
                session.save();
                return true;
            },
            get: (session, key) => session[key],
            has: (session, key) => key in session,
            deleteProperty: (session, key) => {
                delete session[key];
                session.save();
                return true;
            }
        });
        next();
    });
}