const logger = require("./logger")
const mainFile = require("./index")
const reqHandler = require("./reqHandler")
const userDB = require("./userDB")
const template = require("./routes/template")
let configsJSON;
let utillities;
let securityToken = undefined
const fs = require("fs")
// fs.readFile("./config.json", "utf8", (err, jsonString) => {
//     if (err) {
//     } else {
//         configsJSON = JSON.parse(jsonString)
//         securityToken = configsJSON["serverSettings"]["auth"]["accessToken"];
//     }
// })

// i will set a property of req to the config string
// so that any route can access it
module.exports = {
    startup: function(configs, utilities2) {
        configsJSON = configs;
        utillities = utilities2;
    },
    middleware: async function(req, res, next) {
        try {
            if (securityToken != "") {
                let letPass = true;
                let noToken = false;
                let reason = "";
                let user;
                let password;
                const token = req.headers["token"];
                let gonnaKms = mainFile.getRouteDetails(req.originalUrl)
                // THE ORDER OF THE IF STATEMENTS MATTERS!!
                // IF SOMEONE CHANGES THE ORDERS OF THEESE AND FUCKS THEM UP😭
                // if (req.headers["token"] != securityToken) {
                //     letPass = false;
                //     reason = invalidAuthToken;
                //     noToken = true;
                // }
                if (gonnaKms["CHECK_COOKIE"] != undefined) {// if CHECK_COOKIE is true, then extract token from cookie
                    token = req.cookies["accessCookie"]
                }
                if (token != "" && token != undefined) {
                    let [creationEpoch, randomToken, expirationEpoch] = token.split("-");
                    if (creationEpoch != undefined & randomToken != undefined & expirationEpoch != undefined) {
                        if (Date.now() <= parseInt(expirationEpoch)) {
                            const gottenUser = userDB.getUserFromToken(token)
                            if (gottenUser) {
                                user = Object.keys(gottenUser)[0];
                                password = gottenUser[user].password;
                            } else {
                                letPass = false;
                                reason = template.reasons.auth.invalidAuthToken;
                            }
                        } else {
                            letPass = false;
                            reason = template.reasons.auth.token.expired;
                        }
                    } else {
                        letPass = false;
                        reason = template.reasons.auth.token.format.invalid;
                    }
                } else {
                    letPass = false;
                    reason = template.reasons.auth.token.invalid;
                    noToken = true;
                }
                if (gonnaKms["IGNORE_TOKEN"] != undefined) {
                    letPass = true;
                    noToken = true;
                }
                if (letPass) {// if token is expired skip this step for faster proccessing and correct error responses
                    if (gonnaKms["IGNORE_TOKEN"] == undefined && gonnaKms["CHECK_COOKIE"] == undefined && gonnaKms["RESTRICTED"] != undefined) {
                        if (user != undefined && password != undefined && user != "" && password != "") {
                            if (gonnaKms["RESTRICTED"] != undefined) {
                                if (!userDB.checkPermission(user, req.originalUrl)) {
                                    letPass = false;
                                    reason = template.reasons.auth.permissions.userDoesntHave
                                }
                            }
                        } else {
                            letPass = false;
                            reason = template.reasons.auth.token.invalid;
                        }// if they're undefined then reason should be invalid auth token
                    }
                }

                if (letPass) {
                    if (gonnaKms["DONT_LOG_ACCESS"] == undefined) {
                        if (noToken) {
                            logger.announce("Accessed the API !WITH NO TOKEN! : " + req.originalUrl, req)
                        } else {
                            logger.announce("Accessed the API: " + req.originalUrl, req)
                        }
                        req.handler = reqHandler;
                        req.configs = configsJSON
                        const reqID = await reqHandler.createReq();
                        req.reqID = reqID;
                        req.token = token;
                        req.user = user;
                        req.utillities = utillities;
                        next();
                    } else {
                        req.handler = reqHandler;
                        req.configs = configsJSON
                        const reqID = await reqHandler.createReq(true);
                        req.reqID = reqID;
                        req.utillities = utillities;
                        next();
                    }
                } else {
                    logger.announce("Failed to access the API : " + req.originalUrl, req)
                    res.status(400);
                    res.send(reason);
                }
                // old code don't use
                // if (req.headers["token"] == securityToken) {
                //     if (gonnaKms["DONT_LOG_ACCESS"] == undefined) {
                //         if (noToken) {
                //             logger.announce("Accessed the API !WITH NO TOKEN! : " + req.originalUrl, req)
                //         } else {
                //             logger.announce("Accessed the API: " + req.originalUrl, req)
                //         }
                //         req.configs = configsJSON
                //         const reqID = await reqHandler.createReq();
                //         req.reqID = reqID;
                //         next();
                //     } else {
                //         req.configs = configsJSON
                //         const reqID = await reqHandler.createReq(true);
                //         req.reqID = reqID;
                //         next();
                //     }
                // } else {
                //     // ignore favicon request for now
                //     if (req.originalUrl != "/favicon.ico") {
                //         let gonnaKms = mainFile.getRouteDetails(req.originalUrl)
                //         if (gonnaKms["IGNORE_TOKEN"] != undefined) {
                //             if (gonnaKms["CHECK_COOKIE"] != undefined) {
                //                 const orgToken = configsJSON["serverSettings"]["auth"]["accessToken"]
                //                 const hashedCookie = req.cookies["accessCookie"]
                //                 const hashedToken = sha256(orgToken)
                //                 if (hashedCookie == hashedToken) {
                //                     if (gonnaKms["DONT_LOG_ACCESS"] == undefined) {
                //                         logger.announce("Accessed the API !WITH NO TOKEN! : " + req.originalUrl, req)
                //                     }
                //                     req.configs = configsJSON
                //                     let reqID;
                //                     if (gonnaKms["DONT_LOG_ACCESS"] == undefined) {
                //                         reqID = await reqHandler.createReq();
                //                     } else {
                //                         reqID = await reqHandler.createReq(true);
                //                     }
                //                     req.reqID = reqID;
                //                     next();
                //                 } else {
                //                     if (gonnaKms["COOKIE_FAILURE_CALLBACK"] != undefined) {
                //                         gonnaKms["COOKIE_FAILURE_CALLBACK"](req, res)
                //                     } 
                //                 }
                //             } else {
                //                 if (gonnaKms["DONT_LOG_ACCESS"] == undefined) {
                //                     logger.announce("Accessed the API !WITH NO TOKEN! : " + req.originalUrl, req)
                //                 }
                //                 req.configs = configsJSON
                //                 let reqID;
                //                 if (gonnaKms["DONT_LOG_ACCESS"] == undefined) {
                //                     reqID = await reqHandler.createReq();
                //                 } else {
                //                     reqID = await reqHandler.createReq(true);
                //                 }
                //                 req.reqID = reqID;
                //                 next();
                //             }
                //         } else {
                //             res.status(400);
                //             res.send("INVALID AUTH TOKEN!")
                //             logger.announceError("Failed to access the API : " + req.originalUrl, req)
                //         }
                //     }
                // }
            } else {
                res.sendStatus(500);
                console.log("Please specify a security token in config.json")
                logger.announceError("Please specify a security token in config.json")
                throw "Please specify a security token in config.json";
            }
        } catch (err) {
            logger.announceError(err, req)
            res.sendStatus(400)
        }
    }
}
