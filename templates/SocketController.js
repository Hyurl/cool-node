const SocketController = require("cool-node/Core/Controllers/SocketController");

module.exports = class extends SocketController {
    /**
     * e.g. socket.emit("{name}/create", data);
     */
    create(data, socket) {
        // Do stuffs here...
    }

    /** e.g. socket.emit("{name}/get", data) */
    get(data, socket) {
        // Do stuffs here...
    }

    /**
     * e.g. socket.emit("{name}/update", data);
     */
    update(data, socket) {
        // Do stuffs here...
    }

    /** e.g. socket.emit("{name}/delete", data) */
    delete(data, socket) {
        // Do stuffs here...
    }
}