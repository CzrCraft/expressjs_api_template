const template = require("../routes/template");

module.exports = {

    testUtillity: class extends template.Utillity {
        constructor() {
            const path = "foo.bar"
            super(path);
        }
    },

}