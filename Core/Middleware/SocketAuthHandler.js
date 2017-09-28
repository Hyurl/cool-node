const User = require(ROOT + "/App/Models/User");

module.exports = (io) => {
    io.use((socket, next) => {
        if (socket.session.UID) {
            User.use(socket.db).get(socket.session.UID).then(user => {
                socket.user = user;
                next();
            }).catch(err => {
                socket.user = null;
                next();
            });
        } else {
            socket.user = null;
            next();
        }
    });
}