const HttpController = require("../HttpController");
const User = require("../../Models/User");

/**
 * An example of HttpController using RESTful API.
 */
module.exports = class extends HttpController {
    /** e.g POST /Http/User */
    create(req) {
        return User.use(req.db).insert(req.body);
    }

    /** e.g. GET /Http/User/id/1 */
    get(req) {
        if (!req.params.id) {
            throw new Error("400 Bad Request!");
        }
        return User.use(req.db).get(req.params.id);
    }

    /** e.g. PUT /Http/User/id/1 */
    update(req) {
        return this.get(req).then(user => {
            return user.update(req.body);
        });
    }

    /** e.g. DELETE /Http/User/id/1 */
    delete(req) {
        return this.get(req).then(user => {
            return user.delete();
        });
    }

    /** e.g. POST /Http/User/Login */
    postLogin(req) {
        return User.use(req.db).login(req.body).then(user => {
            req.session.UID = user.id;
            return user;
        });
    }

    /** e.g. GET /Http/User/Logout */
    getLogout(req) {
        delete req.session.UID;
        return req.user;
    }
}