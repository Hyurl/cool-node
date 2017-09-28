const User = require(ROOT + "/App/Models/User");

module.exports = (app) => {
    app.use((req, res, next) => {
        if (req.session.UID) {
            User.use(req.db).get(req.session.UID).then(user => {
                req.user = user;
                next();
            }).catch(err => {
                req.user = null;
                next();
            });
        } else {
            req.user = null;
            next();
        }
    });
}