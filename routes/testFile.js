const template = require("./template");
const logger = require("../logger")
let totCount = 0;
async function recursiveUtillitySearch(obj, currentPath, count, req) {
    if (obj instanceof Object && !(obj instanceof template.Utillity)) {
        let tempCount = count
        for (let i = 0; i < Object.keys(obj).length; i++) {
            let utily = obj[Object.keys(obj)[i]]
            if (utily instanceof Object) {
                tempCount += await recursiveUtillitySearch(utily, currentPath + "." + Object.keys(obj)[i], tempCount, req)
            }
        }
        return tempCount;
    } else {
        if (obj instanceof template.Utillity) {
            let passed = true;
            let additionalInfo = "";
            try {
                additionalInfo = await obj.test();
            } catch (err) {
                passed = false;
                additionalInfo = err;
            }
            // bag pula in ele da count ca e o bataie de cap
            // logger.output((passed ? "PASS " : "ERROR") + "  " + "(" + (count + 1) + "/" + totCount + ")  :  " + currentPath)
            await logger.output((passed ? "PASS " : "ERROR") + "  :  " + currentPath + (passed ? "" : "  --> check " + req.reqID + ".json"))
            await req.handler.updateReqStatus(req.reqID, "testing utillities", [
                currentPath,
                (passed ? "PASS" : "ERROR"),
                additionalInfo,
            ])
            return 1;
        } else {
            return 0;
        }
    }
}
// i hate this
// function countUtilltyRecursives(obj, currentPath, count) {
//     if (obj instanceof Object && !(obj instanceof template.Utillity)) {
//         let tempCount = 0;
//         for (let i = 0; i < Object.keys(obj).length; i++) {
//             let utily = obj[Object.keys(obj)[i]]
//             if (utily instanceof Object) {
//                 tempCount += countUtilltyRecursives(utily, currentPath + "." + Object.keys(obj)[i], count)
//             }
//         }
//         return count + tempCount;
//     } else {
//         if (obj instanceof template.Utillity) {
//             return 1;
//         } else {
//             return 0;
//         }
//     }
// }

module.exports = {
    caca: class extends template.Route{
        constructor() {
            const route = "test"
            super(route, undefined, {RESTRICTED: true});
        }
        async GET(req, res) {
            try {
                res.send(req.reqID)
                logger.warn("user -" + req.user + "- requested an API test")
                logger.output("--testing utillities--", undefined, {test: "testMeta"})
                let utilyes = req.utillities
                // totCount = 0
                // for (let i = 0; i < Object.keys(utilyes).length; i++) {
                //     let utily = utilyes[Object.keys(utilyes)[i]]
                //     if (utily instanceof Object) {
                //         totCount += await countUtilltyRecursives(utily, Object.keys(utilyes)[i], 0)
                //     }
                // }
                for (let i = 0; i < Object.keys(utilyes).length; i++) {                                                            
                    let utily = utilyes[Object.keys(utilyes)[i]]
                    if (utily instanceof Object) {
                        await recursiveUtillitySearch(utily, Object.keys(utilyes)[i], 0, req)
                    }
                }
                logger.output("--end--")
            } catch (err) {
                logger.announceError(err, req)
                res.sendStatus(500);
            }
        }
    },
}

