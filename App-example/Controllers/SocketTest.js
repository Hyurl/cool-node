const SocketController = require("./SocketController");

/**
 * An example of HttpController using RESTful API.
 */
module.exports = class extends SocketController {
    /** e.g. socket.emit("SocketTest/showHello") */
    showHello() {
        return `Hello, I'm your socket pal, you can "chat" with me via the socket.io client.\n` +
            `Try typing "socket.emit('SocketTest/repeatWhatISaid', 'Hello, World!')" in you browser console ` +
            `and see what's going to happen.`;
    }

    /** e.g. socket.emit('SocketTest/repeatWhatISaid', 'Hello, World!') */
    repeatWhatISaid(data, socket) {
        return data;
    }
}