const winston = require("winston");
const discord = require("./discord");
const fs = require('fs');
module.exports = {
    announce: async function (message, req) {
        if (req != null) {
            logger.info("-" + req.ip + "- " + message);
            discord.sendInfo("-" + req.ip + "- " + message)
        } else {
            logger.info(message);
            discord.sendInfo(message)
        }
    },
    announceError: async function (message, req) {
        if (req != null) {
            // Use Error object to capture the call stack
            const callerStack = new Error().stack;
            // Split the stack trace into lines
            const stackLines = callerStack.split('\n');
            // The second line usually contains the caller information
            const callerLine = stackLines[2].trim();
            logger.error("-" + req.ip + "- " + message);
            logger.error(callerLine)
            discord.sendError("-" + req.ip + "- " + message)
            discord.sendError(callerLine)
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
            logger.error(message);
            discord.sendError(message)
        }
    },
    logObject: async function (filename, jsObj) {
        const dir = getLogDir();
        if (!fs.existsSync(dir)){
            fs.mkdirSync(dir, { recursive: true });
        }
        const jsonStr = JSON.stringify(jsObj);
        fs.writeFileSync(dir + filename + '.json', jsonStr, 'utf8');
    },
    logProccess: async function (reqID, jsObj) {
        const dir = getLogDirFromEpoch(reqID.split("-")[0]);
        if (!fs.existsSync(dir)){
            fs.mkdirSync(dir, { recursive: true });
        }
        const jsonStr = JSON.stringify(jsObj);
        fs.writeFileSync(dir + reqID + '.json', jsonStr, 'utf8');
    },
    deleteReqcess: async function (reqID) {
        const dir = getLogDirFromEpoch(reqID.split("-")[0]);
        deleteFile(dir + reqID + ".json");
    },
    getProccess: async function (reqID) { // time consuming operation, should not be used often
        const proccessCreation = reqID.split("-")[0]
        const dir = getLogDirFromEpoch(proccessCreation)
        const data = fs.readFileSync(dir + reqID + ".json", 'utf8');
        return JSON.parse(data);
    },
}

function deleteFile(name) {
    fs.unlink(name, (err) => {
        if (err) {
            logger.error(err);
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
    const customTimestamp = new Date().toLocaleString(); // Get local time
    return `${formatLocalTime()} [${level.toUpperCase()}]: ${message}`;
});
let date_ob = new Date();
const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(winston.format.timestamp(), logFormat,),
    exitOnError: false,
    timestamp: true,
    localTime: true,
    transports: [
        new winston.transports.Console(),
        new winston.transports.File({ filename: getLogDir() + 'error.log', level: 'error' }),
        new winston.transports.File({ filename: getLogDir() + 'combined.log' }),
    ],
});