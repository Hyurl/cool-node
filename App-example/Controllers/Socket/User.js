const SocketController = require("../SocketController");
const User = require("../../Models/User");

/**
 * An example of SocketController using socket.io.
 */
module.exports = class extends SocketController {
    /**
     * e.g. socket.emit("Socket/User/create", {
     *          name: "tester",
     *          password: 12345",
     *          email: "tester@localhost"
     *      });
     */
    create(data, socket) {
        return User.use(socket.db).insert(data);
    }

    /** e.g. socket.emit("Socket/User/get", {id: 1}) */
    get(data, socket) {
        if (!data.id) {
            throw new Error("400 Bad Request!");
        }
        return User.use(socket.db).get(data.id);
    }

    /**
     * e.g. socket.emit("Socket/User/update", {
     *          id: 1,
     *          name: "tester"
     *          password: 12345",
     *          email: "tester@localhost"
     *      });
     */
    update(data, socket) {
        return this.get(data, socket).then(user => {
            return user.update(data);
        });
    }

    /** e.g. socket.emit("Socket/User/delete", {id: 1}) */
    delete(data, socket) {
        return this.get(data, socket).then(user => {
            return user.delete();
        });
    }

    /**
     * e.g. socket.emit("Socket/User/login", {
     *          name: "tester"
     *          password: 12345",
     *      });
     */
    login(data, socket) {
        return User.use(socket.db).login(data).then(user => {
            socket.session.UID = user.id;
            return user;
        });
    }

    /** e.g. socket.emit("Socket/User/logout") */
    logout(data, socket) {
        delete socket.session.UID;
        return socket.user;
    }
}