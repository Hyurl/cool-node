**This log starts from version 1.0.4.**

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