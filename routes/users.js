const logger = require("../logger")
const procHandler = require("../reqHandler")
const template = require("./template")
const userDB = require("../userDB")
module.exports = {
    
    createUser: class extends template.Route{
        constructor() {
            const route = "users/register"
            super(route, undefined, {IGNORE_TOKEN: true, RESTRICTED: false});
        }
        async GET(req, res) {
            try {
                const user = req.headers["username"];
                // password should be sent hashed
                // but if the passwords gets set & checked as it's recieved
                // the app should hash it
                const password = req.headers["password"];
                await procHandler.updateReqStatus(req.reqID, "done")
                //check if user already exists
                if (user != undefined && password != undefined && user != "" && password != "") {
                    if (!userDB.exists(user)) {
                        // userDB.dbObject.set(user, { password: password, permissions: [] });
                        //    here we return the new token
                        // return req.configs["serverSettings"]["auth"]["accessToken"];
                        res.send(userDB.createUser(user, password, req.configs.serverSettings.auth.tokenLifetime, req.configs.serverSettings.auth.defaultAccountPermissions));
                    } else {
                        res.status(400);
                        res.send(template.reasons.user.exists)
                    }
                } else {
                    res.status(400);
                    res.send(template.reasons.user.invalidUsernameOrPassword);
                }
                procHandler.deleteReq(req.reqID);
            } catch (err) {
                logger.announceError(err)
                res.sendStatus(400)
            }
        }
    },

    login: class extends template.Route{
        constructor() {
            const route = "users/login"
            super(route, undefined, {IGNORE_TOKEN: true, RESTRICTED: false});
        }
        async GET(req, res) {
            try {
                const user = req.headers["username"];
                // password should be sent hashed
                // but if the passwords gets set & checked as it's recieved
                // the app should hash it
                const password = req.headers["password"];
                await procHandler.updateReqStatus(req.reqID, "done")
                //check if user already exists
                if (user != undefined && password != undefined && user != "" && password != "") {
                    if (userDB.exists(user)) {
                        // userDB.dbObject.set(user, { password: password, permissions: [] });
                        //    here we return the new token
                        // return req.configs["serverSettings"]["auth"]["accessToken"];
                        if (userDB.checkPassword(user, password)) {
                            res.send(userDB.regenToken(user, req.configs.serverSettings.auth.tokenLifetime));
                        } else {
                            res.status(400);
                            res.send(template.reasons.user.invalidUsernameOrPassword);
                        }
                    } else {
                        res.status(400);
                        res.send(template.reasons.user.doesntExist)
                    }
                } else {
                    res.status(400);
                    res.send(template.reasons.user.invalidUsernameOrPassword);
                }
                procHandler.deleteReq(req.reqID);
            } catch (err) {
                logger.announceError(err)
                res.sendStatus(400)
            }
        }
    },

    modify: class extends template.Route{
        constructor() {
            const route = "users/modify"
            super(route, undefined, {RESTRICTED: true});
        }
        async GET(req, res) {
            try {
                const user = req.headers["username"];
                const password = req.headers["password"];
                const targetUser = req.headers["targetUser"];
                const mode = req.headers["mode"]
                const opt = req.headers["optional"]
                //check if user already exists
                if (userDB.exists(user)) {
                    if (userDB.checkPassword(user, password)) {
                        switch (mode) {
                            case "add":
                                if (user != targetUser) {
                                    if (!userDB.checkPermission(targetUser, "modify/protect/self")) {
                                        userDB.addPermission(targetUser, opt)
                                    }
                                } else {
                                    if (userDB.checkPermission(user, "modify/perms/self")) {
                                        userDB.addPermission(targetUser, opt)
                                    } else {
                                        res.status = 400
                                        res.send("doesn't have permission")
                                    }
                                }
                                break;
                            case "remove":
                                if (user != targetUser) {
                                    if (!userDB.checkPermission(targetUser, "modify/protect/self")) {
                                        userDB.removePermission(targetUser, opt)
                                    }
                                } else {
                                    if (userDB.checkPermission(user, "modify/perms/self")) {
                                        userDB.removePermission(targetUser, opt)
                                    } else {
                                        res.status = 400
                                        res.send("doesn't have permission")
                                    }
                                }
                                break;
                            case "delete":
                                    if (!userDB.checkPermission(targetUser, "modify/protect/self")) {
                                        userDB.deleteUser(targetUser)
                                    }
                                break;
                            case "changePassword":
                                if (user != targetUser) {
                                    if (!userDB.checkPermission(targetUser, "modify/protect/self")) {
                                        userDB.changePassword(targetUser, opt)
                                    }
                                } else {
                                    if (userDB.checkPermission(user, "modify/perms/self")) {
                                        userDB.changePassword(targetUser, opt)
                                    } else {
                                        res.status = 400
                                        res.send("doesn't have permission")
                                    }
                                }
                                break;
                        }
                        res.sendStatus(400)
                    }
                } else {
                    res.status(400);
                    res.send("user doesn't exist")
                }
                procHandler.deleteReq(req.reqID);
            } catch (err) {
                logger.announceError(err)
                res.sendStatus(400)
            }
        }
    },
    caca: class extends template.Route{
        constructor() {
            const route = "caca"
            super(route, undefined, {RESTRICTED: true});
        }
        async GET(req, res) {
            try {
                req.handler.updateReqStatus(req.reqID, "working", "test test")
                req.handler.deleteReq(req.reqID)
                res.send("CACA!!! >:3")
            } catch (err) {
                logger.announceError(err, req)
                res.send(500);
            }
        }
    },
}