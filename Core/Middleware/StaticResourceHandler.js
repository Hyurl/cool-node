module.exports = (app, express)=>{
    app.use((req, res, next)=>{
        var path = req.subdomain == "www" ? "App/Assets" : `App.${req.subdomain}/Assets`;
        express.static(path)(req, res, next);
    });
};