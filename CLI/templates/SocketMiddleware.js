module.exports = (io) => {
    io.use((socket, next) => {
        // Do stuffs here...
        next();
    });
};