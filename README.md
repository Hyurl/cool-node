# Cool-Node

**A cool and light weight web framework for Node.js, with abilities of** 
**auto-routing, cross-protocol, multi-apps, and beyond.**

```sh
npm install cool-node --save
```

Please check out the documentation at 
[cool-node.hyurl.com](http://cool-node.hyurl.com) or 
[hyurl.github.io/cool-node/](https://hyurl.github.io/cool-node/).

## Auto-Routing Development

Remember when you were using the node.js internal server or Express, or other 
frameworks, you had to define routes for every actions; when you were using 
socket.io, you complained writing too much socket.on() and socket.emit(). And 
thinking, isn't there any way not to do this? So here comes Cool-Node.

Cool-Node provides an API that will automatically handle these things without 
any of your concerns, you don't even have to call this API in your program, 
all actions will be automatically done by the framework itself.

## Fast Development

Along with auto-routing system, you can save you time to do the real things 
that matter, like manipulate models, writing controllers, and design views. 
With the ability of Modelar (a module for handling models and queries), you 
can handle data in just few seconds.

## Cross-Protocol Development

Cool-Node also give you the ability to handle sessions and share their status 
across HTTP and WebSocket, what you can do with a HTTP request can also be 
done with a WebSocket communication.

## Multi-Apps Development

Cool-Node is a framework that can build multiple applications at one time with
only one server running. It can differ requests (whether they come form HTTP 
or WebSocket) by subdomains, you can use more than one subdomain to write any 
count of applications as you want.

## Example

In JavaScript (`/App/Controllers/HttpTest.js`):

```javascript
const HttpController = require("./HttpController");

module.exports = class extends HttpController{
    index(){
        return this.view({
            title: "Cool-Node Test",
            content: "Hello, World!"
        });
    }
}
```

And in the HTML (`/App/Views/HttpTest/index.html`):

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <title><%=title%></title>
</head>
<body>
    <h1><%-content%></h1>
</body>
```