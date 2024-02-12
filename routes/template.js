const logger = require("../logger")
const reasons = { // global response failure reasons
    // same set of reasons will be inside the app in used as keys in a dict for responses
    auth: {
        token: {
            invalid: "auth_token_invalid",
            expired: "auth_token_expired",
            format: {
                invalid: "auth_token_format_invalid"
            }
        },
        cookie: {
            invalid: "auth_cookie_invalid",
        },
        permissions: {
            userDoesntHave: "auth_user_permissions_lack",
        }
    },
    user: {
        exists: "user_exists",
        doesntExist: "user_notExists",
        invalidUsernameOrPassword: "user_headers_invalid",
    }
}

module.exports = {
    reasons: reasons,
    // boillerplate for other routes :)
    // if someone other than my retarded ass reading this
    // and don't know how this shet works
    // just look at other files
    IGNORE_FILE: function () { 
        // so that this file is skipped because this has no valid routes
        // IGNORE_FILE can be a function, a variable it can be anything as long as it's
        // value isn't "undefined"
    },
    Route: class {
        constructor(route, additionalParams, options) {
            // IGNORE_TOKEN, OWN_ALL_CHILD_ROUTES, DONT_LOG_ACCESS, CHECK_COOKIE
            this.path = route;
            this.params = additionalParams
            if (options != undefined) {
                this.IGNORE_TOKEN = options["IGNORE_TOKEN"]
                this.OWN_ALL_CHILD_ROUTES = options["OWN_ALL_CHILD_ROUTES"]
                this.DONT_LOG_ACCESS = options["DONT_LOG_ACCESS"]
                this.CHECK_COOKIE = options["CHECK_COOKIE"]
                this.COOKIE_FAILURE_CALLBACK = options["COOKIE_FAILURE_CALLBACK"]
                this.RESTRICTED = options["RESTRICTED"]
                if (options["IGNORE_TOKEN"] == false) {
                    this.IGNORE_TOKEN = undefined
                }
                if (options["OWN_ALL_CHILD_ROUTES"] == false) {
                    this.OWN_ALL_CHILD_ROUTES = undefined
                }
                if (options["DONT_LOG_ACCESS"] == false) {
                    this.DONT_LOG_ACCESS = undefined
                }
                if (options["CHECK_COOKIE"] == false) {
                    this.CHECK_COOKIE = undefined
                }
                if (options["RESTRICTED"] == undefined) {// default restricted ON 4 security
                    this.RESTRICTED = true
                }
                if (options["RESTRICTED"] == false) {
                    this.RESTRICTED = undefined
                }
            }
        }
        async GET(req, res) { res.sendStatus(400); req.reqHandler.deleteReq(req.reqID);     }
        async POST(req, res) { res.sendStatus(400); req.reqHandler.deleteReq(req.reqID);    }
        async PUT(req, res) { res.sendStatus(400); req.reqHandler.deleteReq(req.reqID);     }
        async DELETE(req, res) { res.sendStatus(400); req.reqHandler.deleteReq(req.reqID);  }
        async HEAD(req, res) { res.sendStatus(400); req.reqHandler.deleteReq(req.reqID);    }
        async CONNECT(req, res) { res.sendStatus(400); req.reqHandler.deleteReq(req.reqID); }
        async OPTIONS(req, res) { res.sendStatus(400); req.reqHandler.deleteReq(req.reqID); }
        async TRACE(req, res) { res.sendStatus(400); req.reqHandler.deleteReq(req.reqID);   }
        async PATCH(req, res) { res.sendStatus(400); req.reqHandler.deleteReq(req.reqID);   }
        // async GET(req, res) { }
        // async POST(req, res) { }
        // async PUT(req, res) { }
        // async DELETE(req, res) { }
        // async HEAD(req, res) { }
        // async CONNECT(req, res) {}
        // async OPTIONS(req, res) {}
        // async TRACE(req, res) {}
        // async PATCH(req, res) { }
    },
    Utillity: class {
        constructor(path) {
            this.path = path;
            // used for organizing
            // so parent is the filename(for example deliciu.js -> deliciu)
            // and this path is separated by a dot
            // and objects are created based on this path
            // for example the path "do.stuff" in the fille "foo" is going to end up as "foo.do.stuff"
            // ends up {foo: {do: {stuff: func()}}}
        }
        async startup() { }
        async test() {
            await logger.announce("Utillity does not have a test func")
            return "Utillity does not have a test func"
        }
    },
    Command: class {
        constructor(commandString) {
            this.commandString = commandString
        }
        async called(params) {}
    }
}