const fs = require("fs");
const util = require("util");
const { EOL } = require("os");
const { randStr, xmkdir } = require("./Functions");
const Storage = {};

/**
 * A temporary space for storing data, data are firstly stored in memory, then
 * after a TTL time, flushed to a disk file.
 */
class TempStorage {
    /**
     * Creates a new storage instance.
     * 
     * @param {String|Object} options Include these options:
     *  - `id` The storage id, if missing, a random id will be generated.
     *  - `ttl` Time to live, default is `1000`ms.
     *  - `filename` A disk file for storing expired data, if missing, data 
     *      will be discard.
     *  - `fileSize` Maximum size of the output file.
     *  - `fileLimit` A function called when the output file's size up to 
     *      limit, rewrite by default.
     *  - `error` An error handler called when any error occurred in the 
     *      asynchronous timeout scope.
     * 
     *  If this parameter is passed as a string, then it will be treated as 
     *  both `id` and `filename`.
     */
    constructor(options = {}) {
        if (typeof options == "string") {
            options = { id: options, filename: options };
        }
        this.id = options.id || randStr(16);
        this.ttl = options.ttl || 1000;
        this.filename = options.filename; // Flush to file when expires.
        this.fileSize = options.fileSize || 1024 * 1024 * 2; // 2 MB.
        this.fileLimit = options.fileLimit || ((file, data, next) => {
            try {
                fs.writeFileSync(file, data);
                next();
            } catch (e) {
                this.error(e);
            }
        });
        this.error = options.error || (err => {
            console.error(err);
        });

        if (Storage[this.id] === undefined) {
            Storage[this.id] = null;
            var next = () => {
                this.timer = setTimeout(() => {
                    if (this.filename && Storage[this.id]) {
                        var data = Storage[this.id].join(EOL) + EOL;
                        Storage[this.id] = null;
                        try {
                            if (fs.existsSync(this.filename)) {
                                // File exists, test file size.
                                var stat = fs.statSync(this.filename),
                                    size = stat.size + Buffer.byteLength(data);
                                if (size >= this.fileSize) {
                                    this.fileLimit(this.filename, data, next);
                                } else {
                                    // if not up to limit, then append contents.
                                    fs.appendFileSync(this.filename, data);
                                    next();
                                }
                            } else {
                                var dirname = path.dirname(this.filename);
                                if (!fs.existsSync(dirname)) {
                                    // If the directory doesn't exist, create a new one.
                                    xmkdir(dirname);
                                }
                                // File not exists, create a new one.
                                fs.writeFileSync(this.filename, data);
                                next();
                            }
                        } catch (e) {
                            this.error(e);
                        }
                    } else {
                        Storage[this.id] = null;
                        next();
                    }
                }, this.ttl);
            };
            next();
        }
    }

    /**
     * Pushes data into the storage.
     * @param {Any} data The data needs to be stored.
     */
    push(...data) {
        if (arguments.length > 1) {
            for (let part of data) {
                this.push(part);
            }
            return;
        } else {
            data = data[0];
        }
        if (data === null || data === undefined) {
            return;
        } else if (typeof data != "string") {
            data = util.format(data);
        }
        if (Storage[this.id] === null) {
            Storage[this.id] = [];
        } else if (Storage[this.id] === undefined) {
            throw new Error("Cannot push data after the storage is closed.");
        }
        Storage[this.id].push(data);
    }

    /**
     * Destroys the storage, removes its data from memory.
     */
    destroy() {
        delete Storage[this.id];
        clearTimeout(this.timer);
    }
}

module.exports = TempStorage;