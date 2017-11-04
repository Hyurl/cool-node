const Logger = require("../Tools/Logger");
const Channel = require("../Tools/Channel");
const cluster = Channel.cluster;
const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

function initWorker(worker, code) {
    worker.code = code;
    worker.on("online", () => {
        // Tell the worker process its worker code.
        Channel.emitTo(worker.id, "ready", code);
    }).on("exit", (_code, signal) => {
        if (_code) { // If a worker exits accidentally, create a new one.
            var worker = cluster.fork();
            initWorker(worker, code);
        }
    });
}

if (cluster.isMaster && config.server.workers) {
    for (let i = 0; i < config.server.workers; i++) {
        let worker = cluster.fork();
        initWorker(worker, CHARS[i]);
    }

    // Handle logs.
    Channel.on("log", (data) => {
        var logger = new Logger(data.filename, data.action);
        logger.filename = data.filename;
        logger.fileSize = data.fileSize;
        logger.ttl = data.ttl;
        logger.mailTo = data.mailTo;
        logger.__output(data.level, ...data.msg);
    });
} else if (cluster.isWorker) {
    process.on("error", err => {
        // If any error occurs, exit the current process, a new one will be 
        // forked automatically.
        process.exit(1);
    });
}