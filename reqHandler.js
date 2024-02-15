const logger = require("./logger")

// PROC IS SHORT FOR PROCCESS IF YOU'RE WONDERING
let reqArray = {}

// these are the statuses i will use:
//   init -> when the proccess is initialising
//   working -> while the proccess is handling the request
//   done -> after it has finnished working
//        -> the info value is going to be set to the result of the route
//   error -> request errored out

// req id is creationEpoch-randomNum

function getRandomInt(max) {
  return Math.floor(Math.random() * max);
}



// TODO: RESET PROC ARRAY AFTER A DAY

module.exports = {
    // i use this req aproach to be able to have loading statuses and more, along with easier tracking and logging of functions
    // basically i allow the app to show a loading screen
    createReq: async function (dont_log) {
        // create a random reqID and make sure that it isn't already present in reqArray
        const reqID = Date.now() + "-" + getRandomInt(10000000000)
        while (reqID in reqArray) {
            reqID = Date.now() + "-" + getRandomInt(10000000000)
        }
        reqArray[reqID] = [];
        reqArray[reqID][0] = {
            "status": "init",
            "info": "",
        };
        if (dont_log == undefined) {
            logger.request("New request was made with ID: " + reqID)
        }
        logger.logProccess(reqID, reqArray[reqID]);
        return reqID;
    },
    updateReqStatus: async function (reqID, newStatus, newInfo = "") {
        if (reqID != undefined && reqID != "" && newStatus != undefined) {
            // set the proccesses new status and info
            // reqArray[reqID] = {
            //     "status": newStatus,
            //     // if new info wasn't specified, then don't set new info
            //     "info": (newInfo == "") ? reqArray[reqID]["info"] : newInfo
            // }
            reqArray[reqID].push({
                "status": newStatus,
                "info": newInfo
            })
            // reqArray[reqID].status = newStatus;
            // reqArray[reqID].info = newInfo;
            logger.logProccess(reqID, reqArray[reqID]);
        } else {
            logger.announceError("Undefined parameters passed to updateReqStatus")
            throw "Undefined parameters passed to updateReqStatus";
        }
    },
    getReqInfo: async function (reqID) {
        if (reqID != undefined && reqID != "") {
            let memProc = reqArray[reqID];
            if (memProc == undefined) { // if the proccess is not in memory anymore(API restarted, proccesses were flushed etc..) grab it from storage
                return logger.getProccess(reqID);
            } else {
                return memProc;
            }
        } else {
            logger.announceError("Incorrect parameters passed to getReqInfo")
            throw "Incorrect parameters passed to getReqInfo";
        }
    },
    deleteReq: async function (reqID, dont_log) {
        if (reqID != undefined && reqID != "") {
            delete reqArray[reqID];
            logger.deleteReqcess(reqID);
            if (dont_log == undefined) {
                logger.request("Deleted a proccess with Proccess ID: " + reqID)
            }
        } else {
            logger.request("Incorrect parameters passed to deleteReq")
            throw "Incorrect parameters passed to deleteReq";
        }
    },
    getAllProc: async function () {
        return reqArray;
    },
}