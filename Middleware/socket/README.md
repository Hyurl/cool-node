This folder stores user-defined middleware for Socket.io applications. All 
JavaScript files must export a function with a signature like this:

```javascript
module.exports = (io) => {
    // io is the Socket.io application, so you can use all its featrues here.
}
```