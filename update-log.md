**This log starts from version 1.0.4.**

## 1.1.3

<small>(2017-10-8 0:47 UTC+0800)</small>

1. Fix a bug in auto-routing handler.

## 1.1.1

<small>(2017-10-7 17:12 UTC+0800)</small>

1. Change the algorithm for parsing routes, efficiency improved.
2. Fix some bugs.

## 1.1.0

<small>(2017-10-6 15:40 UTC+0800)</small>

1. Add two global variables: `wsServer` and `wssServer`.
2. Delete `/Middleware/http.js` and `/Middleware/socket.js`.
3. More features has been added to controllers.
4. Stability improved.

## 1.0.8

<small>(2017-10-5 23:30 UTC+0800)</small>

1. Change the request type of `controller.update()` to `PACTH` according to 
    [RFC5789](https://tools.ietf.org/html/rfc5789).

## 1.0.7

<small>(2017-10-5 17:50 UTC+0800)</small>

1. Fix a bug while loading user-defined middleware.

## 1.0.6

<small>(2017-10-4 19:31 UTC+0800)</small>

1. Add supports for XML request and sending XML to clients.
2. Fix a bug.

## 1.0.4

<small>(2017-10-4 12:49 UTC+0800)</small>

1. Add support for HTTPS.
2. Fix some bugs.