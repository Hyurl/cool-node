const HttpController = require("cool-node/Core/Controllers/HttpController");

module.exports = class extends HttpController {
    /** e.g. GET /{name} */
    index(req, res) {
        // Do stuffs here...
    }

    /** e.g POST /{name} */
    create(req, res) {
        // Do stuffs here...
    }

    /** e.g. GET /{name}/id/1 or GET /{name}/get/id/1 */
    get(req, res) {
        // Do stuffs here...
    }

    /** e.g. PATCH /{name}/id/1 */
    update(req, res) {
        // Do stuffs here...
    }

    /** e.g. DELETE /{name}/id/1 */
    delete(req, res) {
        // Do stuffs here...
    }
}