const fs = require("fs");
const zlib = require("zlib");
const path = require("path");
const util = require("util");
const Mail = require("./Mail");
const DateTime = require("./DateTime");
const TempStorage = require("./TempStorage");
const Channel = require("./Channel");
const { nextFilename } = require("../Tools/Functions");
const { EOL } = require("os");

class Logger {
    /**
     * Creates a new instance with a specified filename.
     * 
     * @param {String} filename A file that stores the logs.
     * @param {String} [action] An optional action name.
     */
    constructor(filename, action = "") {
        this.filename = filename;
        this.fileSize = 1024 * 1024 * 2; // 2 MB
        this.ttl = 1000; // Flush to file when expires.
        this.action = action || "none";

        // If this property is set, when the log file up to limit, send its 
        // contents to the receiver. Must configure mail information in 
        // `config.js` first.
        this.mailTo = "";

        this.storage = null;
    }

    /** Outputs a message to the log file. */
    __output(level, ...msg) {
        if (Channel.isWorker) {
            Channel.emit("log", {
                filename: this.filename,
                fileSize: this.fileSize,
                ttl: this.ttl,
                mailTo: this.mailTo,
                action: this.action,
                level,
                msg
            });
            return;
        }

        // Get time info.
        var dateTime = new DateTime;
        var timeStr = dateTime.toString();

        msg = util.format(...msg);
        msg = `[${timeStr}] [${level}] ${this.action} - ${msg}`;

        if (this.storage === null) {
            this.storage = new TempStorage({
                id: this.filename,
                ttl: this.ttl,
                filename: this.filename,
                fileSize: this.fileSize,
                fileLimit: (file, data, next) => {
                    // If size out of limit:
                    try {
                        if (this.mailTo) {
                            // send old logs as email to the receiver.
                            var host = Array.isArray(config.server.host) ?
                                config.server.host[0] :
                                config.server.host,
                                mail = new Mail(`[Logs] of ${host}`),
                                contents = fs.readFileSync(this.filename, "utf8");
                            mail.to(this.mailTo)
                                .text(contents)
                                .send()
                                .then(info => {
                                    // Rewrite the log file.
                                    fs.writeFile(this.filename, data, err => {
                                        if (err)
                                            this.error(err);
                                        else
                                            next();
                                    });
                                }).catch(err => {
                                    this.error(err);
                                    next();
                                });
                        } else {
                            // Compress the old file to GZip.
                            var date = dateTime.date,
                                dir = path.dirname(this.filename) + `/${date}/`,
                                basename = path.basename(this.filename);
                            if (!fs.existsSync(dir)) {
                                fs.mkdirSync(dir);
                            }
                            var gzName = nextFilename(`${dir}${basename}.gz`, ".log.gz"),
                                gzip = zlib.createGzip(),
                                input = fs.createReadStream(this.filename),
                                output = fs.createWriteStream(gzName);
                            input.pipe(gzip).pipe(output);
                            output.on("close", () => {
                                // Rewrite the log file.
                                fs.writeFile(this.filename, data, err => {
                                    if (err)
                                        this.error(err);
                                    next();
                                });
                            });
                        }
                    } catch (err) {
                        this.error(err);
                    }
                },
                error: (err) => {
                    this.error(err);
                }
            });
        }
        this.storage.push(msg);
    }

    /**
     * Outputs a message to the log file at LOG level.
     * 
     * @param {String} msg Log message.
     */
    log(...msg) {
        return this.__output("LOG", ...msg);
    }

    /**
     * Outputs a message to the log file at DEBUG level.
     * 
     * @param {String} msg Log message.
     */
    debug(...msg) {
        return this.__output("DEBUG", ...msg);
    }

    /**
     * Outputs a message to the log file at INFO level.
     * 
     * @param {String} msg Log message.
     */
    info(...msg) {
        return this.__output("INFO", ...msg);
    }

    /**
     * Outputs a message to the log file at WARN level.
     * 
     * @param {String} msg Log message.
     */
    warn(...msg) {
        return this.__output("WARN", ...msg);
    }

    /**
     * Outputs a message to the log file at ERROR level.
     * 
     * @param {String} msg Log message.
     */
    error(...msg) {
        return this.__output("ERROR", ...msg);
    }
}

module.exports = Logger;