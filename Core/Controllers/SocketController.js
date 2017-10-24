const Controller = require("./Controller");

/**
 * SocketController manages requests from a Socket.io client.
 * 
 * When you define a method in a SocketController, it will be called 
 * automatically when a Socket.io event fires. All methods in a 
 * SocketController accept two parameters in the following sequence: 
 * 
 * - `data` sent by the client;
 * - `socket` the underlying socket;
 * 
 * When a method is defined, the client can `emit` the event which is 
 * `Controller/method` and sending data to the server. The method may return 
 * some data, when it's called by the client, it will be handled in a Promise 
 * constructor, so you can do what ever you want in it, just remember to put 
 * the code in a Promise if you are doing asynchronous actions.
 * 
 * If you want to send data manually, you can call the `socket` that passed
 * into the method to do so.
 * 
 * Any thing returned by a method will be sent to the client in the same event
 * name, which is `Controller/method`, so the client can listen to it for 
 * receiving data.
 */
class SocketController extends Controller {
    /**
     * Create a new socket controller instance.
     * 
     * You can pass a third parameter `next` to the constructor, if such a 
     * parameter is defined, then the constructor can handle asynchronous 
     * actions. And at where you want to call the real method, use 
     * `next(this);` to call it.
     * 
     * @param  {Object}  options  Options for initiation.
     * @param  {Socket}  socket  The underlying socket object.
     */
    constructor(options, socket) {
        super(options);

        this.authorized = socket.user !== null;
    }
}

module.exports = SocketController;