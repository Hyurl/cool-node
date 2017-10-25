const fs = require("fs");
const path = require("path");
const ejs = require("ejs");
const Logger = require("../Tools/Logger");
const MarkdownParser = require("../Tools/MarkdownParser");

// Configure EJS delimiter.
if (typeof config.view == "object") {
    ejs.delimiter = config.view.delimiter || "%";
}

/**
 * The Controller give you a common API to return data to the underlying 
 * response context, all controllers will be automatically handled by the 
 * framework, which will save your work from setting HTTP routes and socket 
 * events.
 */
class Controller {
    /**
     * Creates a controller inistance.
     * 
     * @param  {Object}  options  Options for initiation.
     */
    constructor(options) {
        // ViewPath, defaultView, action and actionName will be auto set 
        // properly by the framework when a request event fires.
        this.viewPath = options.viewPath || "App/Views";
        this.defaultView = options.defaultView || "index";
        // Full called method name (including class path).
        this.action = options.action;
        // Called method name.
        this.actionName = options.actionName;

        // If requireAuth is true, when calling the controller unauthorized, a
        // 401 error will be thrown.
        this.requireAuth = false;

        // This property indicates whether the operation is authorized.
        this.authorized = false;

        // Configurations for Logger tool.
        this.logConfig = {
            filename: "",
            fileSize: 0,
            mailTo: "",
        }
    }

    /**
     * Sends a view file to the response context.
     * 
     * @param  {String}  tplName  [optional] The template name. Template files
     *  are stored in `App[.subdomain]/Views/`, if the filename ends with a
     *  `.html` as its extension name, you can pass this argument without one.
     *  If this argument is missing, then the `defaultView` will be used.
     * 
     * @param  {Object}  vars  [optional] Additional variables passed to the 
     *  template, these variables will replace the placeholders in the view 
     *  file.
     * 
     * @return {Promise} Returns a Promise, and the only argument passed to 
     *  the callback of `then()` is the contents of the template with its 
     *  placeholders replaced with `vars`.
     */
    view(tplName = "", vars = {}) {
        if (tplName === "" || typeof tplName == "object") {
            vars = tplName || {};
            tplName = this.defaultView;
        }
        tplName = tplName.toString();
        if (path.extname(tplName) === "")
            tplName += ".html";
        return new Promise((resolve, reject) => {
            var file = ROOT + "/" + this.viewPath + "/" + tplName;
            ejs.renderFile(file, vars, {}, (err, content) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(content);
                }
            });
        });
    }

    /**
     * Sends a view file to the response context, and parse it as a markdown 
     * file.
     * 
     * This method rely on the module `highlightjs`, so when displaying code 
     * snippets, you need to include CSS files to the HTML page manually.
     * 
     * @param  {String}  tplName  [optional] The template name. Template files
     *  are stored in `App[.subdomain]/Views/`, if the filename ends with a
     *  `.md` as its extension name, you can pass this argument without one. 
     *  If this argument is missing, then the `defaultView` will be used.
     * 
     * @return {Promise} Returns a Promise, and the only argument passed to 
     *  the callback of `then()` is the parsed contents of the template.
     */
    viewMarkdown(tplName = "") {
        tplName = tplName || this.defaultView;
        if (path.extname(tplName) === "")
            tplName += ".md";
        return new Promise((resolve, reject) => {
            var file = ROOT + "/" + this.viewPath + "/" + tplName;
            fs.readFile(file, "utf8", (err, content) => {
                if (err) {
                    reject(err);
                } else {
                    try {
                        content = MarkdownParser(content);
                        resolve(content);
                    } catch (err) {
                        reject(err);
                    }
                }
            });
        });
    }

    /**
     * Sends successful action results to the response context.
     * 
     * @param  {Any}  data  The data that needs to be send.
     * 
     * @param  {Number}  code  [optional] A code represented the status of the
     *  action, default is `200`.
     * 
     * @return {Object} An object that carries these information:
     *  - `success` Indicates if the action is successful, always true.
     *  - `code` The same `code` given above.
     *  - `data` The same `data` given above.
     */
    success(data, code = 200) {
        return {
            success: true,
            code,
            data,
        };
    }

    /**
     * Sends failed action results to the response context.
     * 
     * @param  {String|Error}  msg  A message or an Error that indicates the 
     *  failed reason.
     * 
     * @param  {Number}  code  [optional] A code represented the status of the
     *  action, default is `500`.
     * 
     * @return {Object} An object that carries these information:
     *  - `success` Indicates if the action is successful, always false.
     *  - `code` The same `code` given above.
     *  - `error` The error message, same as `msg`.
     *  - `msg` The same `msg` given above, deprecated.
     */
    error(msg, code = 500) {
        msg = msg instanceof Error ? msg.message : msg;
        return {
            success: false,
            code,
            error: msg,
            msg,
        };
    }

    /**
     * Gets the logger instance.
     */
    get logger() {
        if (!this.__logger) {
            var conf = this.logConfig;
            if(conf.filename){
                var filename = conf.filename;
            }else{
                var appPath = path.dirname(`${ROOT}/${this.viewPath}`),
                    filename = appPath + "/Logs/cool-node.log";
            }
            this.__logger = new Logger(filename, this.action);
            this.__logger.fileSize = conf.fileSize || 1024 * 1024 * 1024;
            this.__logger.mailTo = conf.mailTo;
        }
        return this.__logger;
    }
}

module.exports = Controller;