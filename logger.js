const winston = require("winston");
const discord = require("./discord")
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
        } else {
            logger.error(message);
            discord.sendError(message)
        }
    },
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

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}:${millySeconds}Z`;
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
        new winston.transports.File({ filename: 'logs/' + date_ob.getFullYear() + "/" + "Month-" + (date_ob.getMonth() + 1) + "/" + "Day-" + date_ob.getDate() + "/" + 'error.log', level: 'error' }),
        new winston.transports.File({ filename: 'logs/' + date_ob.getFullYear() + "/" + "Month-" + (date_ob.getMonth() + 1) + "/" + "Day-" + date_ob.getDate() + "/" + 'combined.log' }),
    ],
});