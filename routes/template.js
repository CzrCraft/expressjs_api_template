module.exports = {
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
            }
        }
        async GET(req, res) { res.sendStatus(400) }
        async POST(req, res) { res.sendStatus(400) }
        async PUT(req, res) { res.sendStatus(400) }
        async DELETE(req, res) { res.sendStatus(400) }
        async HEAD(req, res) { res.sendStatus(400) }
        async CONNECT(req, res) { res.sendStatus(400) }
        async OPTIONS(req, res) { res.sendStatus(400) }
        async TRACE(req, res) { res.sendStatus(400) }
        async PATCH(req, res) { res.sendStatus(400) }
    },
    UtilitiesFunction: class {
        constructor() { }
        
        async startup() { }
    },
    Command: class {
        constructor(commandString) {
            this.commandString = commandString
        }
        async called(params) {}
    }
}