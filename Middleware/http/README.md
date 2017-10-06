This folder stores user-defined middleware for Express applications. All 
JavaScript files must export a function with a signature like this:

```javascript
module.exports = (app) => {
    // app is the Express application, so you can use all its featrues here.
}
```