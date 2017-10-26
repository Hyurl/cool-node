const Model = require("modelar/Model");

class __Model__ extends Model {
    /**
     * Creates a new __Model__ instance.
     * 
     * @param {Object} data Initial data of the __Model__.
     */
    constructor(data = {}) {
        super(data, {
            table: "__table__",
            primary: "id",
            fields: ["id", "field2", "field3"],
            searchable: ["field2", "field3"]
        });
    }
}

module.exports = __Model__;