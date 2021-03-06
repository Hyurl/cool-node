**This log starts from version 1.0.4.**

## 1.4.2

(2017-11-15 16:32 UTC+0800)

1. Fix some bugs.

## 1.4.1

(2017-11-15 16:32 UTC+0800)

1. Fix some bugs.

## 1.4.0

(2017-11-4 23:20 UTC+800)

1. XSS protection supported, CSRF protection improved.
2. I18n supported.
3. Change the way to launch the server.
4. Cookie parsed for both HTTP and socket.
5. Logging system more efficient.
6. More tools added.
7. Support methods extended from parent controller.
8. Multi-processing supported.

## 1.3.4

(2017-10-30 11:30 UTC+800)

1. Uploaded filename could be random or user-defined.
2. Socket clients automatically join into the room of the subdomain app.
3. Generator methods (*/yield) are supported in controllers.
4. More error handling policy, `error`  object will be passed to error pages.
5. If clients accept, thrown errors will be sent as JSON with 200 status.
6. Jsonp is supported.
7. CSRF Protection is supported.
8. Fix a bug on visiting the same URL with different request method.

## 1.3.3

(2017-10-28 11:23 UTC+0800)

1. Fix a bug in command line app generator.

## 1.3.2

(2017-10-27 20:39 UTC+0800)

1. File upload support.
2. Other features improved.

## 1.3.0

(2017-10-26 21:31 UTC+0800)

1. File log support.
2. `controller.success()` and `controller.error()` return an object.
3. Asynchronous actions in a controller's constructor.
4. `urlParams` property is defined to determine what params a HttpController 
    may accept.
5. New command line app generator.
6. Automatically initiate the main app after installing Cool-Node.
7. Fix a bug.

## 1.2.5

(2017-10-21 11:50 UTC+0800)

1. Automatically compress data to GZip if supported.
2. More socket properties for convenience.
3. Socket methods support more parameters.
4. HttpController's constructor support a third parameter `res`.
5. `config.server.host` could be an array for multiple hosts.
6. Fix a BUG of markdown-view.

## 1.2.4

(2017-10-14 10:20 UTC+0800)

1. Fix some bugs.
2. `controller.RESTfulMap` is set by a setter since this version.

## 1.2.3

(2017-10-12 22:50 UTC+0800)

1. More flexible on WebSocket server, and user settings for Socket.io.

## 1.2.2

(2017-10-11 2:12 UTC+0800)

1. If a controller method name begins with `_`, then it cannot be accessed by 
    a client.

## 1.2.1

(2017-10-11 2:12 UTC+0800)

1. When return `null` or `undefined` in a HttpController, send response with 
    no body.
2. More flexible when dealing with XML.

## 1.2.0 [Important]

(2017-10-10 16:45 UTC+0800)

1. Change the structure of the project, no need to copy all files any more.

## 1.1.5

(2017-10-9 18:11 UTC+0800)

1. Use user-defined User model to make authentication.

## 1.1.4

(2017-10-9 11:06 UTC+0800)

1. Fix a bug when loading static resources with `Forever`.

## 1.1.3

(2017-10-8 0:47 UTC+0800)

1. Fix a bug in auto-routing handler.

## 1.1.1

(2017-10-7 17:12 UTC+0800)

1. Change the algorithm for parsing routes, efficiency improved.
2. Fix some bugs.

## 1.1.0

(2017-10-6 15:40 UTC+0800)

1. Add two global variables: `wsServer` and `wssServer`.
2. Delete `/Middleware/http.js` and `/Middleware/socket.js`.
3. More features has been added to controllers.
4. Stability improved.

## 1.0.8

(2017-10-5 23:30 UTC+0800)

1. Change the request type of `controller.update()` to `PACTH` according to 
    [RFC5789](https://tools.ietf.org/html/rfc5789).

## 1.0.7

(2017-10-5 17:50 UTC+0800)

1. Fix a bug while loading user-defined middleware.

## 1.0.6

(2017-10-4 19:31 UTC+0800)

1. Add supports for XML request and sending XML to clients.
2. Fix a bug.

## 1.0.4

(2017-10-4 12:49 UTC+0800)

1. Add support for HTTPS.
2. Fix some bugs.