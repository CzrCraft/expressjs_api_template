const logger = require("../logger")
const procHandler = require("../procHandler")
const template = require("./template")

function parseJsonToOutput(input) {
    return JSON.stringify(input, null, "\t").replace(new RegExp('"', 'g'), '')
}

module.exports = {

    getProcStatus: class extends template.Route{
        constructor() {
            const route = "proccess/getStatus"
            super(route);
        }
        async GET(req, res) {
            try {
                const procID = req.headers["proccessid"]
                await procHandler.updateProcStatus(req.procID, "done")
                const result = await procHandler.getProcInfo(procID)
                if (result == undefined) {
                    res.sendStatus(400)
                } else {
                    res.send(result);
                }
                procHandler.deleteProc(req.procID);
            } catch (err) {
                logger.announceError(err)
                res.sendStatus(400)
            }
        }
    },

    proccessCommands: class extends template.Command{
        constructor() {
            const command = "proc"
            super(command);
        }
        async called(params) {
            function printHelp() {
                const paramsObject = {
                    "-h": "show list of available commands",
                    "-s": "get a proccess's status(command + proccessID)",
                    "-c": "create a proccess",
                    "-d": "delete a proccess(command + proccessID)",
                    "-m": "modify a proccess's status(command + procID + new status + new info)",
                    "-a": "see all of the current proccesses",
                }
                logger.announce(parseJsonToOutput(paramsObject))
            }
            if (params == undefined || params == "") {
                logger.announce("Specify a command")
                printHelp()
            } else {
                switch (params[0]) {
                    case "-h":
                        printHelp()
                        break;
                    case "-s":
                        const proccessID = params[1]
                        if (proccessID != undefined) {
                            const result = await procHandler.getProcInfo(proccessID)
                            if (result == undefined) {
                                logger.announceError("Proccess not found")
                            } else {
                                logger.announce(parseJsonToOutput(result))
                            }
                            
                        } else {
                            logger.announceError("Input to proc -s SHOULD BE THE PROCCESS ID")
                        }
                        break;
                    case "-c":
                        const proc = await procHandler.createProc(true)
                        logger.announce("CREATED PROCCESS WITH THIS ID: " + proc)
                        break;
                    case "-d":
                        const procID = params[1]
                        if (procID != undefined) {
                            await procHandler.deleteProc(procID)
                        }
                        break;
                    case "-a":
                        const result = await procHandler.getAllProc()
                        logger.announce(parseJsonToOutput(result))
                    case "-m":
                        const procid = params[1]
                        const newStatus = params[2]
                        const newInfo = params[3]
                        if (procid != undefined && newStatus != undefined && newInfo != undefined) {
                            await procHandler.updateProcStatus(procid, newStatus, newInfo)
                        } else {
                            logger.announce
                        }
                }
            }
            // try {
            //     const procID = req.headers["proccessid"]
            //     await procHandler.updateProcStatus(req.procID, "done")
            //     const result = await procHandler.getProcInfo(procID)
            //     if (result == undefined) {
            //         res.sendStatus(500)
            //     } else {
            //         res.send(result);
            //     }
            //     procHandler.deleteProc(req.procID);
            // } catch (err) {
            //     logger.announceError(err)
            //     res.sendStatus(400)
            // }
        }
    },
}