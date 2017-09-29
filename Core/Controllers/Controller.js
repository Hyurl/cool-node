const ejs = require("ejs");
const path = require("path");
const marked = require("marked");
const hljs = require("highlightjs");
const renderer = new marked.Renderer();

//Render markdown headings.
renderer.heading = function(text, level) {
    var id = text.toLowerCase().replace(/\s/g, '-')
        .match(/[\-0-9a-zA-Z]+/g).join("");
    return `<h${level} id="${id}">
    <a class="heading-anchor" href="#${id}">
        <svg aria-hidden="true" height="16" version="1.1" viewBox="0 0 16 16" width="16">
            <path fill-rule="evenodd" d="M4 9h1v1H4c-1.5 0-3-1.69-3-3.5S2.55 3 4 3h4c1.45 0 3 1.69 3 3.5 0 1.41-.91 2.72-2 3.25V8.59c.58-.45 1-1.27 1-2.09C10 5.22 8.98 4 8 4H4c-.98 0-2 1.22-2 2.5S3 9 4 9zm9-3h-1v1h1c1 0 2 1.22 2 2.5S13.98 12 13 12H9c-.98 0-2-1.22-2-2.5 0-.83.42-1.64 1-2.09V6.25c-1.09.53-2 1.84-2 3.25C6 11.31 7.55 13 9 13h4c1.45 0 3-1.69 3-3.5S14.5 6 13 6z"></path>
        </svg>
    </a>${text}
</h${level}>
`;
};

//Render markdown codes to be highlighted.
renderer.code = function(code, lang, escaped) {
    return `<pre>
    <code class="lang-${lang} hljs">
        ${hljs.highlightAuto(code).value}
    </code>
</pre>
`;
};

/**
 * The Controller give you a common API to return data to the underlying 
 * response context, all controllers will be automatically handled by the 
 * framework, which will save your work from setting HTTP routes and socket 
 * events.
 */
class Controller {
    constructor(options = {}) {
        this.viewPath = options.viewPath || "App/Views";
        this.defaultView = options.defaultView || "index";
    }

    /**
     * Sends a view file to the response context.
     * 
     * @param  {String}  tplName  The template name. Template files are stored
     *  in `App/Views/`, if the filename ends with .html as its extension 
     *  name, you can pass this argument without the extension name.
     * 
     * @param  {Object}  vars  Additional variables passed to the template, 
     *  these variables will replace the placeholders in the view file.
     * 
     * @return {String} Returns the contents of the template with its 
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
        return this.__handleView(tplName, vars);
    }

    /**
     * Sends a view file to the response context, and parse it as a markdown 
     * file.
     * 
     * This method rely on the module `highlightjs`, so when displaying code 
     * snippets, you need to include CSS files to the HTML page manually.
     * 
     * @param  {String}  tplName  The template name. Template files are stored
     *  in `App/Views/`, if the filename ends with .html as its extension 
     *  name, you can pass this argument without the extension name.
     * 
     * @param  {Object}  vars  Additional variables passed to the template, 
     *  these variables will replace the placeholders in the view file.
     * 
     * @return {String} Returns the contents of the template with its 
     *  placeholders replaced with `vars`.
     */
    viewMarkdown(tplName = "", vars = {}) {
        if (tplName === "" || typeof tplName == "object") {
            vars = tplName || {};
            tplName = this.defaultView;
        }
        if (path.extname(tplName) === "")
            tplName += ".md";
        return this.__handleView(tplName, vars).then(content => {
            return marked(content, { renderer: renderer });
        });
    }

    /** Handles a view template. */
    __handleView(tplName, vars) {
        return new Promise((resolve, reject) => {
            var file = "./" + this.viewPath + "/" + tplName;
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
     * Sends successful action results to the response context.
     * 
     * @param  {Any}  data  The data that needs to be send.
     * 
     * @param  {Number}  code  A code represented the status of the action.
     * 
     * @return {Object} Return a object which carries these information:
     *  - `success` Indicates if the action is successful, always true.
     *  - `data` The same `data` given above.
     *  - `code` The same `code` given above.
     */
    success(data, code = 0) {
        return new Promise(resolve => {
            resolve({
                success: true,
                data,
                code,
            });
        });
    }

    /**
     * Sends failed action results to the response context.
     * 
     * @param  {Any}  msg  A message the indicates the failed reason.
     * 
     * @param  {Number}  code  A code represented the status of the action.
     * 
     * @return {Object} Return a object which carries these information:
     *  - `success` Indicates if the action is successful, always false.
     *  - `msg` The same `msg` given above.
     *  - `code` The same `code` given above.
     */
    error(msg, code = 0) {
        return new Promise(resolve => {
            resolve({
                success: false,
                msg,
                code,
            });
        });
    }
}

module.exports = Controller;