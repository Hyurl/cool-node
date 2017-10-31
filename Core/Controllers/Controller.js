const path = require("path");
const util = require("util");
const ejs = require("ejs");
const Logger = require("../Tools/Logger");
const MarkdownParser = require("../Tools/MarkdownParser");
const LocalesMap = require("../Bootstrap/LocaleMap");

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
        // The subdomain of the current app.
        this.subdomain = options.subdomain || "www";
        // The path of the current app.
        this.appPath = options.appPath || "App";

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

        // The accepting language of the current client.
        this.lang = options.lang || "en-US";
        // Set a default language, all languages must reference to the default
        // language, and when the request language doesn't exist, fallback to 
        // the default one.
        this.defaultLang = "en-US";

        // Configurations for Logger tool.
        this.logConfig = {
            filename: "",
            fileSize: 0,
            mailTo: "",
            ttl: 1000,
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
            if (!("i18n" in vars)) {
                vars.i18n = (...text) => {
                    return this.i18n(...text);
                };
            }
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
        var filename = ROOT + "/" + this.viewPath + "/" + tplName;
        return MarkdownParser.parseFile(filename);
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
     */
    error(msg, code = 500) {
        msg = msg instanceof Error ? msg.message : msg;
        return {
            success: false,
            code,
            error: msg
        };
    }

    /**
     * Gets the logger instance.
     */
    get logger() {
        if (!this.__logger) {
            var conf = this.logConfig;
            if (conf.filename) {
                var filename = conf.filename;
            } else {
                var filename = this.appPath + "/Logs/cool-node.log";
            }
            this.__logger = new Logger(filename, this.action);
            this.__logger.fileSize = conf.fileSize || 1024 * 1024 * 2;
            this.__logger.mailTo = conf.mailTo;
            this.__logger.ttl = conf.ttl;
        }
        return this.__logger;
    }

    /**
     * Gets a locale text via i18n. 
     * 
     * If is a HTTP request, check `req.query.lang` or `req.cookies.lang`, if 
     * is socket message, check `socket.cookies.lang`, if any appears, then 
     * always use the setting language, otherwise, check header 
     * `Accept-Language` instead. Language files are stored in `App/Locales`, 
     * could be json or js, and case insensitive.
     * 
     * @param  {String}  text  The original text, accept multiple arguments 
     *  and format with %s, %i, etc.
     * 
     * @return {String}  The final text.
     */
    i18n(...text) {
        var locale = LocalesMap[this.subdomain],
            lang = this.lang.toLowerCase(),
            _lang = this.defaultLang.toLowerCase();
        if (locale[lang] && locale[lang][text[0]]) {
            text[0] = locale[lang][text[0]];
        } else if (locale[_lang] && locale[_lang][0]) {
            text[0] = locale[_lang][text[0]];
        }
        return util.format(...text);
    }
}

module.exports = Controller;