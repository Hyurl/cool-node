const Logger = require("../Tools/Logger");
const Channel = require("../Tools/Channel");
const cluster = Channel.cluster;

if (cluster.isMaster && config.server.workers) {
    for (let i = 0; i < config.server.workers; i++) {
        let worker = cluster.fork();
        worker.on("exit", (code, signal) => {
            if (code) { // If a worker exits accidentally, create a new one.
                cluster.fork();
            }
        });
    }
    Channel.on("log", (data) => {
        // Handle logs.
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