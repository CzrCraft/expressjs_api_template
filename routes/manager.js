const logger = require("../logger")
const procHandler = require("../procHandler")
const template = require("./template")
const path = require('path');

const currentPath = process.cwd();
const managerGUIFiles = currentPath + "\\manager\\"

module.exports = {
    getMainManagerPage: class extends template.Route{
        constructor() {
            // MAKE SURE TO HAVE THIS SLASH
            const route = "manager/"
            // question mark means it can be empty so just parent path
            const params = "name"
            const IGNORE_TOKEN = true // ignore auth token cuz browser can't send it so i have to use cookies
            const OWN_ALL_CHILD_ROUTES = true // this will make it so this route's properties will apply to all of it's children
            super(route, params, IGNORE_TOKEN, OWN_ALL_CHILD_ROUTES);
        }
        async GET(req, res) {
            try {
                const childRoute = req.params.name
                if (childRoute == undefined) {
                    res.sendFile(managerGUIFiles + "index.html")
                } else {
                    res.sendStatus(404)
                }
                procHandler.deleteProc(req.procID);
                //res.sendStatus(200);
            } catch (err) {
                logger.announceError(err)
                res.sendStatus(400)
            }
        }
    },
}