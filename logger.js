const winston = require("winston");
const discord = require("./discord");
var _ = require('lodash');
const fs = require('fs');
module.exports = {
    announceHTTP: async function (message, req, meta) {
        if (req != null) {
            backLogger.log("http", "-" + req.ip + "- " + message, _.merge({
                meta: {
                    caller_ip: req.ip,
                    user: req.user,
                    token: req.token,
                    req_id: req.reqID,
                }
            },meta)
            );
            await discord.sendInfo("-" + req.ip + "- " + message)
        } else {
            backLogger.log("http",message, meta);
            await discord.sendInfo(message)
        }
    },
    user: async function (message, req, meta) {
        if (req != null) {
            backLogger.log("user", "-" + req.ip + "- " + message, _.merge({
                meta: {
                    caller_ip: req.ip,
                    user: req.user,
                    token: req.token,
                    req_id: req.reqID,
                }
            },meta)
            );
            await discord.sendInfo("-" + req.ip + "- " + message)
        } else {
            backLogger.log("user",message, meta);
            await discord.sendInfo(message)
        }
    },
    output: async function (message, req, meta) {
        if (req != null) {
            backLogger.log("output", "-" + req.ip + "- " + message, _.merge({
                meta: {
                    caller_ip: req.ip,
                    user: req.user,
                    token: req.token,
                    req_id: req.reqID,
                }
            },meta)
            );
            await discord.sendInfo("-" + req.ip + "- " + message)
        } else {
            backLogger.log("output",message, meta);
            await discord.sendInfo(message)
        }
    },
    warn: async function (message, req, meta) {
        if (req != null) {
           // backLogger.log({ level: "warn", message: "-" + req.ip + "- " + message });
            backLogger.log("warn", "-" + req.ip + "- " + message, Object.assign({}, {
                caller_ip: req.ip,
                user: req.user,
                token: req.token,
                req_id: req.reqID
            }, meta)  );
            await discord.sendInfo("-" + req.ip + "- " + message)
        } else {
            //backLogger.log({ level: "warn", message: message });
            backLogger.log("warn",message, meta);
            await discord.sendInfo(message)
        }
    },
    // profile: async function (profile) {
    //     if (profile != null && profile != undefined) {
    //         backLogger.profile(profile);
    //     } else {
    //         console.log("sugi putulica :)")
    //     }
    // },
    major_event: async function (message, req, meta) {
        if (req != null) {
            //backLogger.log({ level: "major_event", message: "-" + req.ip + "- " + message });
            backLogger.log("major_event", "-" + req.ip + "- " + message, Object.assign({}, {
                caller_ip: req.ip,
                user: req.user,
                token: req.token,
                req_id: req.reqID
            }, meta)  );
            await discord.sendInfo("-" + req.ip + "- " + message)
        } else {
            backLogger.log("major_event",message, meta);
            //backLogger.log({ level: "major_event", message: message });
            await discord.sendInfo(message)
        }
    },
    request: async function (message, req, meta) {
        if (req != null) {
            //backLogger.log({ level: "request", message: "-" + req.ip + "- " + message });
            backLogger.log("request", "-" + req.ip + "- " + message, Object.assign({}, {
                caller_ip: req.ip,
                user: req.user,
                token: req.token,
                req_id: req.reqID
            }, meta)  );
            await discord.sendInfo("-" + req.ip + "- " + message)
        } else {
            backLogger.log("request", message, meta);
            //backLogger.log({ level: "request", message: message });
            await discord.sendInfo(message)
        }
    },
    announce: async function (message, req, meta) {
        if (req != null) {
            //backLogger.log({ level: "info", message: "-" + req.ip + "- " + message, meta });
            backLogger.log("info", "-" + req.ip + "- " + message, Object.assign({}, {
                caller_ip: req.ip,
                user: req.user,
                token: req.token,
                req_id: req.reqID
            }, meta)  );
            await discord.sendInfo("-" + req.ip + "- " + message)
        } else {
            //backLogger.log({ level: "info", message: message });
            backLogger.log("info",message, meta);
            await discord.sendInfo(message)
        }
    },
    announceDynamic: async function (whatToDo, message, req, meta) {
        if (whatToDo) {
            await this.announce(message, req, meta)
        } else {
            await this.announceError(message, req, meta)
        }
    },
    announceError: async function (message, req, meta) {
        if (req != null) {
            // Use Error object to capture the call stack
            const callerStack = new Error().stack;
            // Split the stack trace into lines
            const stackLines = callerStack.split('\n');
            // The second line usually contains the caller information
            const callerLine = stackLines[2].trim();
            // backLogger.log({ level: "error", message: "-" + req.ip + "- " + message });
            // backLogger.log({ level: "error", message: callerLine })
            backLogger.log("error", "-" + req.ip + "- " + message, meta);
            backLogger.log("error", callerLine, meta);
            await discord.sendError("-" + req.ip + "- " + message)
            await discord.sendError(callerLine)
            // now update req status to error
            req.handler.updateReqStatus(req.reqID, "error", {
                "caller_ip": req.ip,
                "error_line": callerLine,
                "error": message,
                "req_id": req.reqID,
                "token": req.token,
                "user": req.user
            });
        } else {
            backLogger.log("error",message, meta);
            //backLogger.log({ level: "error", message: message });
            await discord.sendError(message)
        }
    },
    logObject: function (filename, jsObj) {
        const dir = getLogDir();
        if (!fs.existsSync(dir)){
            fs.mkdirSync(dir, { recursive: true });
        }
        const jsonStr = JSON.stringify(jsObj, null, 2);
        fs.writeFileSync(dir + filename + '.json', jsonStr, 'utf8');
    },
    logProccess: function (reqID, jsObj) {
        const dir = getLogDirFromEpoch(reqID.split("-")[0]);
        if (!fs.existsSync(dir)){
            fs.mkdirSync(dir, { recursive: true });
        }
        const jsonStr = JSON.stringify(jsObj, null, 2);
        fs.writeFileSync(dir + reqID + '.json', jsonStr, 'utf8');
    },
    deleteReqcess: function (reqID) {
        const dir = getLogDirFromEpoch(reqID.split("-")[0]);
        deleteFile(dir + reqID + ".json");
    },
    getProccess: function (reqID) { // time consuming operation, should not be used often
        const proccessCreation = reqID.split("-")[0]
        const dir = getLogDirFromEpoch(proccessCreation)
        const data = fs.readFileSync(dir + reqID + ".json", 'utf8');
        return JSON.parse(data);
    },
}

function deleteFile(name) {
    fs.unlink(name, (err) => {
        if (err) {
            backLogger.log({ level: "error", message: err });
            discord.sendError(err)
        }
    });
}

function formatLocalTime() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    const millySeconds = String(now.getMilliseconds()).padStart(3, '0');

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}:${millySeconds}`;
}

function getLogDir() {
    return 'logs/' + date_ob.getFullYear() + "/" + "Month-" + (date_ob.getMonth() + 1) + "/" + "Day-" + date_ob.getDate() + "/";
}
function getLogDirFromEpoch(epochDate) {
    var d = new Date(0); // The 0 there is the key, which sets the date to the epoch
    d.setUTCMilliseconds(epochDate);
    return 'logs/' + d.getFullYear() + "/" + "Month-" + (d.getMonth() + 1) + "/" + "Day-" + d.getDate() + "/";
}

const logFormat = winston.format.printf(({ level, message, timestamp }) => {
    return `${formatLocalTime()} [${level}]: ${message}`;
});
let date_ob = new Date();
const levelsAndColors = {
    levels: {
        error: 0,
        warn: 1,
        info: 2,
        user: 3,
        major_event: 4,
        http: 5,
        request: 6,
        output: 7,
        all: 8,
    },
    colors: {
        error: "bold red",
        warn: "bold yellow",
        info: "bold white",
        user: "bold magenta",
        major_event: "bold blue",
        http: "bold green",
        request: "bold cyan",
        output: "bold white"
    }
}
winston.addColors(levelsAndColors.colors)
const backLogger = winston.createLogger({
    levels: levelsAndColors.levels,
    format: winston.format.combine( 
        winston.format.timestamp(),
        logFormat,
    ),
    exitOnError: false,
    timestamp: true,
    localTime: true,
    transports: [
        new winston.transports.Console({
            level: "http",
            format: winston.format.combine(
                winston.format.colorize({level: true, message: false},), 
                winston.format.timestamp(),
                logFormat,
            ),
        }),
        new winston.transports.File({ filename: getLogDir() + 'error.log', level: 'error', }),
        new winston.transports.File({ filename: getLogDir() + 'clean.log', level: "http" }),
        new winston.transports.File({ filename: getLogDir() + 'all.log', level: "all" }),

        new winston.transports.File({ filename: getLogDir() + 'error.json', level: 'error', format: winston.format.json()}),
        new winston.transports.File({ filename: getLogDir() + 'clean.json', level: "http" , format: winston.format.json()}),
        new winston.transports.File({ filename: getLogDir() + 'all.json', level: "output", format: winston.format.json() }),
    ],
});