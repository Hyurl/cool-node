const fs = require("fs");
const zlib = require("zlib");
const path = require("path");
const util = require("util");
const Mail = require("./Mail");
const DateTime = require("./DateTime");
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
        this.fileSize = 1024 * 1024 * 1024; // 1 MB.
        this.action = action || "default";

        // If this property is set, when the log file up to limit, send its 
        // contents to the receiver. Must configure mail information in 
        // `config.js` first.
        this.mailTo = "";
    }

    /** Outputs a message to the log file. */
    __output(level, ...msg) {
        // Get time info.
        var dateTime = new DateTime;
        var timeStr = dateTime.toString();

        // Convert msg.
        msg = msg.map(item => {
            return item instanceof Error ? item.message : item;
        });
        // Get log contents.
        msg = util.format(...msg);
        var logStr = `[${timeStr}] [${level}] ${this.action} - ${msg}${EOL}`;

        if (fs.existsSync(this.filename)) {
            // File exists, test file size.
            var stat = fs.statSync(this.filename);
            if (stat.size + Buffer.byteLength(msg) >= this.fileSize) {
                // If size out of limit,
                if (this.mailTo) {
                    // send old logs as email to the receiver.
                    var host = Array.isArray(config.server.host) ?
                        config.server.host[0] :
                        config.server.host,
                        mail = new Mail(`[Logs] of ${host}`),
                        contents = fs.readFileSync(this.filename, "utf8");
                    mail.to(this.mailTo).text(contents).send().then(info => {
                        // Rewrite the log file.
                        fs.writeFileSync(this.filename, logStr);
                    }).catch(err => {
                        this.error(err);
                    });
                } else {
                    // Compress the old file to GZip.
                    var date = dateTime.date,
                        dir = path.dirname(this.filename) + `/${date}/`,
                        basename = path.basename(this.filename);
                    if(!fs.existsSync(dir)){
                        fs.mkdirSync(dir);
                    }
                    var gzName = nextFilename(`${dir}${basename}.gz`, ".log.gz"),
                        gzip = zlib.createGzip(),
                        input = fs.createReadStream(this.filename),
                        output = fs.createWriteStream(gzName);
                    input.pipe(gzip).pipe(output);
                    output.on("close", () => {
                        // Rewrite the log file.
                        fs.writeFileSync(this.filename, logStr);
                    });
                }
            } else {
                // if not out of limit, then append contents.
                fs.appendFileSync(this.filename, logStr);
            }
        } else {
            var dirname = path.dirname(this.filename);
            if (!fs.existsSync(dirname)) {
                // If the directory doesn't exist, create a new one.
                fs.mkdirSync(dirname);
            }
            // File not exists, create a new one.
            fs.writeFileSync(this.filename, logStr);
        }
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