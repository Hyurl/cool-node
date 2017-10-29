const path = require("path");
const Controller = require("./Controller");
const { randStr } = require("../Tools/Functions");

/**
 * HttpController manages requests come from a HTTP request, it provides a 
 * RESTful API to handle requests. And it provides methods with special 
 * meanings to handle requests.
 * 
 * You can define methods named with the structure `typeAction`, and the 
 * framework will automatically handle the request of which method is the 
 * `type` and the pathname is `/Controller/Action`, so that you don't need to 
 * defined routes manually. Also, if the request path has other parts after 
 * the controller and action, they will be treated as parameters.
 * 
 * All methods in a HttpController accept two parameters as the Express 
 * routes do: 
 * 
 * - `req` the underlying request;
 * - `res` the underlying response;
 * 
 * You may `return` some data inside the method, when the method is called by 
 * a HTTP request, they will be automatically sent to the client. Actions will
 * be handled in a Promise constructor, so you can do what ever you want in 
 * the method, just remember to put the code in a Promise if you are doing 
 * asynchronous operations.
 * 
 * If you want to send a response manually, you can call the `res` that passed
 * into the method, no more data will be sent after sending one.
 * 
 * If you define a method `index()` in the controller, this method will be 
 * called if the request doesn't explicitly specify a action, meaning you 
 * can use it to show a index page of the controller.
 * 
 * If you define a method `get()` method in the controller, which is in the 
 * RESTful map, this method will be called if the request method is GET. But 
 * when the method `index()` present, the `index()` will be called instead.
 * In this case, you need explicitly specify the `get` action in the URL.
 * 
 * All RESTful methods are (by default):
 * 
 * - `get` listen GET;
 * - `create` listen POST;
 * - `update` listen PATCH;
 * - `delete` listen DELETE;
 * 
 * you can change them by reassigning the setter property `RESTfulMap`.
 */
class HttpController extends Controller {
    /**
     * Creates a new HTTP controller instance.
     * 
     * You can pass a fourth parameter `next` to the constructor, if such a 
     * parameter is defined, then the constructor can handle asynchronous 
     * actions. And at where you want to call the real method, use 
     * `next(this);` to call it.
     * 
     * @param  {Object}  options  Options for initiation.
     * @param  {ClientRequest}  req  The underlying request object.
     * @param  {ServerResponse}  res  The underlying response object.
     */
    constructor(options, req, res) {
        super(options);

        // If fallbackTo is set, when unauthorized, fallback to the given URL.
        this.fallbackTo = "";

        this.authorized = req.user !== null;

        // Send data compressed to GZip.
        this.gzip = true;

        // An array defines what parameters that the controller accepts, null 
        // means disabled and accepts all.
        this.urlParams = null;

        // Set a callback name for jsonp, false means disabled.
        this.jsonp = "callback";

        // Enable token checking, if true, when request method is DELETE, 
        // PATCH, POST or PUT, the client must send a `x-csrf-token` field to 
        // the server via request header, URL parameters, URL query or request
        // body. You can call `req.csrfToken` to get the auto-generated token 
        // in a GET action and pass it to a view.
        this.csrfToken = false;

        // Configurations for uploading files.
        this.uploadConfig = {
            fields: [], // Fields that carry files.
            maxCount: 1, // Max number of files that each field can carry.
            savePath: ROOT + "/" + path.dirname(this.viewPath) + "/Uploads",
            filter: (file) => true, // true: accept, false: reject.
        };
    }

    /**
     * This property carries the information of RESTful methods. each pair 
     * corresponding a method name and a request type.
     */
    get RESTfulMap() {
        return {
            get: "GET",
            create: "POST",
            update: "PATCH",
            delete: "DELETE",
        };
    }
}

module.exports = HttpController;