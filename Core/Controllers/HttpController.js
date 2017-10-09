const Controller = require("./Controller");

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
 * You may `return` some data from the method, when the method is called by a 
 * HTTP request, it will be handled in a Promise constructor, so you can do 
 * what ever you want in the method, just remember to put the code in a 
 * Promise if you are doing asynchronous actions.
 * 
 * If you want to send a response manually, you can call the `res` that passed
 * into the method, no more data will be sent automatically after sending one.
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
 * you can change them by reassigning the property `RESTfulMap`.
 */
class HttpController extends Controller {
    /**
     * Create a new HTTP controller instance.
     * 
     * @param  {Object}  options  Options for initiation.
     * @param  {ClientRequest}  req  The underlying request object.
     */
    constructor(options = {}, req = null) {
        super(options);

        // This property carries the information of RESTful methods. each 
        // pair corresponding a method name and a request type.
        this.RESTfulMap = {
            get: "GET",
            create: "POST",
            update: "PATCH",
            delete: "DELETE",
        };

        // If fallbackTo is set, when unauthorized, fallback to the given URL.
        this.fallbackTo = "";

        this.authorized = req && req.user !== null;
    }
}

module.exports = HttpController;