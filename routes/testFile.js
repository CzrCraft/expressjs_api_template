const template = require("./template");
const logger = require("../logger")
function recursiveSearch(obj, currentPath) {
    if (obj instanceof Object && !(obj instanceof template.Utillity)) {
        for (let i = 0; i < Object.keys(obj).length; i++) {
            let utily = obj[Object.keys(obj)[i]]
            if (utily instanceof Object) {
                recursiveSearch(utily, currentPath + "." + Object.keys(obj)[i])
            }
        }
    } else {
        if (obj instanceof template.Utillity) {
            logger.announce("Testing utillity: " + currentPath)
            obj.test();
        }
    }
}

module.exports = {
    caca: class extends template.Route{
        constructor() {
            const route = "caca"
            super(route, undefined, {RESTRICTED: true});
        }
        async GET(req, res) {
            try {
                res.send("CACA!!! >:3")
                logger.announce("--testing utillities--")
                let utilyes = req.utillities
                for (let i = 0; i < Object.keys(utilyes).length; i++) {
                    req.handler.updateReqStatus(req.reqID, "testing utillities", (i + 1) + "/" + Object.keys(utilyes).length)
                    let utily = utilyes[Object.keys(utilyes)[i]]
                    if (utily instanceof Object) {
                        recursiveSearch(utily, Object.keys(utilyes)[i])
                    }
                }
            } catch (err) {
                logger.announceError(err, req)
                res.send(500);
            }
        }
    },
}

