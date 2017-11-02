const cluster = require("cluster");

class Channel {
    /** Is the process a master? */
    static get isMaster() {
        return cluster.isMaster;
    }

    /** Is the process a worker? */
    static get isWorker() {
        return cluster.isWorker;
    }

    /** A reference to cluster. */
    static get cluster() {
        return cluster;
    }

    /** 
     * Adds a listener function to an event.
     * @param {String} event The event name.
     *  @param {Function} handler An event handler function, it accepts at 
     *  least one parameter, which is the data sent by another worker or the 
     *  master process.
     * @return {Channel}
     */
    static on(event, handler) {
        if (cluster.isMaster) {
            cluster.on("message", (worker, msg) => {
                if (msg && msg.event === event) {
                    handler.call(this, ...msg.data);
                }
            });
        } else {
            process.on("message", (msg) => {
                if (msg && msg.event === event) {
                    handler.call(this, ...msg.data);
                }
            });
        }
        return this;
    }

    /** 
     * Adds a listener function to an event that will only run once.
     * @param {String} event The event name.
     * @param {Function} handler An event handler function, it accepts at 
     *  least one parameter, which is the data sent by another worker or the 
     *  master process.
     * @return {Channel}
     */
    static once(event, handler) {
        if (cluster.isMaster) {
            cluster.once("message", (worker, msg) => {
                if (msg && msg.event === event) {
                    handler.call(this, ...msg.data);
                }
            });
        } else {
            process.once("message", (msg) => {
                if (msg && msg.event === event) {
                    handler.call(this, ...msg.data);
                }
            });
        }
        return this;
    }

    /**
     * Emit a message to the master process or to worker processes.
     * @param {String} event The event name.
     * @param {Any} data A list of data, they will be received by the event 
     *  listener.
     * @return {Channel}
     */
    static emit(event, ...data) {
        if (cluster.isMaster) {
            return this.broadcast(event, ...data);
        } else {
            process.send({ event, data });
        }
    }

    /**
     * Emit a message to a specified worker process.
     * @param {Number} id Could be either a worker id or a pid.
     * @param {String} event The event name.
     * @param {Any} data A list of data, they will be received by the event 
     *  listener.
     * @return {Channel}
     */
    static emitTo(id, event, ...data) {
        if (cluster.isMaster) {
            if (cluster.workers[id]) {
                cluster.workers[id].send({ event, data });
            } else {
                for (let _id in cluster.workers) {
                    if (cluster.workers[_id].process.pid === id) {
                        cluster.workers[_id].send({ event, data });
                    }
                }
            }
        } else {
            process.send({
                event: "----transmit----",
                data: { receiver: id, event, data }
            });
        }
    }

    /**
     * Broadcast a massage to all worker processes.
     * @param {String} event The event name.
     * @param {Any} data A list of data, they will be received by the event 
     *  listener.
     * @return {Channel}
     */
    static broadcast(event, ...data) {
        if (cluster.isMaster) {
            for (let id in cluster.workers) {
                this.emitTo(id, event, ...data);
            }
        } else {
            process.send({
                event: "----broadcast----",
                data: { event, data }
            });
        }
    }
}

if (cluster.isMaster) {
    // Handle transmit and broadcast.
    cluster.on("message", (worker, msg) => {
        if (msg && msg.event == "----transmit----") {
            msg = msg.data;
            Channel.emitTo(msg.receiver, msg.event, ...msg.data);
        } else if (msg && msg.event == "----broadcast----") {
            msg = msg.data;
            Channel.emit(msg.event, ...msg.data);
        }
    });
}

module.exports = Channel;