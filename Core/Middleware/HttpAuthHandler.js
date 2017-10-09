const UserMap = require("../Bootstrap/UserMap");

module.exports = (app) => {
    app.use((req, res, next) => {
        if (req.session.UID) {
            var User = UserMap[req.subdomain];
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