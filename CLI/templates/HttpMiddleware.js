module.exports = (app) => {
    app.use((req, res, next) => {
        // Do stuffs here...
        next();
    });
};