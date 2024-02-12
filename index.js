var _ = require('lodash');
const express = require("express");
const app = express();
const fs = require("fs")
const logger = require("./logger")
const customMiddleware = require("./middleware")
const template = require("./routes/template")
const cookieParser = require("cookie-parser")
const cluster = require('node:cluster');
const { availableParallelism } = require('node:os')
let extraRouteDetails = {}
let utillities = {}
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }))

app.use(customMiddleware.middleware)
function isClass(variable) {
    return typeof variable === 'function' && variable.prototype && variable.prototype.constructor === variable;
}

function getInstanceVariables(instance) {
    // thank u chat gpt :D
    const variableNames = Object.getOwnPropertyNames(instance);
    const variablesObject = {};

    for (const variableName of variableNames) {
        variablesObject[variableName] = instance[variableName];
    }

    return variablesObject;
}

async function checkDirAndImportRoutes(path) {
    const routesFiles = await fs.readdirSync(path)
    let result = []
    for (const routeFile of routesFiles) {
        // make sure is javascript file
        const isFile = !fs.lstatSync(path + routeFile).isDirectory()
        if (isFile && routeFile.includes(".js") && !routeFile.includes(".json")) {
            // get only the file name and import it
            const newInclude = require(path + routeFile.split(".")[0])
            // so that files like template.js get skipped
            // this value can be defined however u want
            if (newInclude["IGNORE_FILE"] == undefined) {
                // different functions add details here then after this is done it appends it to extraRouteDetails
                // so that the middle can check which paths should ignore the auth token
                for (const value of Object.values(newInclude)) {
                    // make sure this is a route and nuthin else
                    if (isClass(value)) {
                        // don't know why i save em
                        const valueInstance = new value()
                        if (valueInstance instanceof template.Route) {
                            let extraDetails
                            if (valueInstance.path[0] == "/") {
                                extraDetails = {
                                    route: "/api" + valueInstance.path,
                                    content: {}
                                }
                            } else {
                                extraDetails = {
                                    route: "/api/" + valueInstance.path,
                                    content: {}
                                }
                            }
                            let routePath;
                            let orgPath;
                            if (valueInstance.params != undefined) {
                                routePath = "/api/" + valueInstance.path + ":" + valueInstance.params + "?";
                                orgPath = "/api/" + valueInstance.path;
                            } else {
                                routePath = "/api/" + valueInstance.path;
                            }
                            app.post(routePath, valueInstance.POST)
                            app.get(routePath, valueInstance.GET)
                            app.put(routePath, valueInstance.PUT)
                            app.connect(routePath, valueInstance.CONNECT)
                            app.head(routePath, valueInstance.HEAD)
                            app.delete(routePath, valueInstance.DELETE)
                            app.trace(routePath, valueInstance.TRACE)
                            app.patch(routePath, valueInstance.PATCH)
                            app.options(routePath, valueInstance.OPTIONS)
                            result.push(valueInstance);
                            // really running out of names😭
                            const addittionalShit = getInstanceVariables(valueInstance)
                            for (const key in addittionalShit) { 
                                extraDetails["content"][key] = addittionalShit[key]
                                // extraDetails["content"]["IGNORE_TOKEN"] = valueInstance["IGNORE_TOKEN"]
                                // extraDetails["content"]["OWN_ALL_CHILD_ROUTES"] = valueInstance["OWN_ALL_CHILD_ROUTES"]
                                // extraDetails["content"]["DONT_LOG_ACCESS"] = valueInstance["DONT_LOG_ACCESS"]
                                // extraDetails["content"]["CHECK_COOKIE"] = valueInstance["CHECK_COOKIE"]
                                // extraDetails["content"]["COOKIE_FAILURE_CALLBACK"] = valueInstance["COOKIE_FAILURE_CALLBACK"]
                                extraRouteDetails[extraDetails.route] = extraDetails["content"]
                            }
                        }
                    }
                }
            }
        }
        if (!isFile) {
            const output = await checkDirAndImportRoutes(path + routeFile + "/")
            result = result.concat(output);
        }
    }
    return result;
}

function getProp(prop, obj) {
    if (typeof obj !== 'object') throw 'getProp: obj is not an object'
    if (typeof prop !== 'string') throw 'getProp: prop is not a string'

    // Replace [] notation with dot notation
    prop = prop.replace(/\[["'`](.*)["'`]\]/g,".$1")

    return prop.split('.').reduce(function(prev, curr) {
        return prev ? prev[curr] : undefined
    }, obj || self)
} 

// function recursiveObjSearch(obj) {
    
// }  

// function setNestedValue(path, obj, toSet) {
//     const keys = path.split('.');
//     let current = obj;
//     let pastCurrent = current;
//     for (let key of keys) {
//         pastCurrent = current;
//         current = current[key];
//     }
//     if (current != toSet) {
//         current = toSet;
//         return;
//     }

// }

async function checkDirAndImportUtillities(path) {
    const routesFiles = await fs.readdirSync(path)
    for (const routeFile of routesFiles) {
        // make sure is javascript file
        const isFile = !fs.lstatSync(path + routeFile).isDirectory()
        if (isFile && routeFile.includes(".js") && !routeFile.includes(".json")) {
            // get only the file name and import it
            const newInclude = require(path + routeFile.split(".")[0])
            // so that files like template.js get skipped
            // this value can be defined however u want
            if (newInclude["IGNORE_FILE"] == undefined) {
                // different functions add details here then after this is done it appends it to extraRouteDetails
                // so that the middleware can check which paths should ignore the auth token
                // the fuck did i write here?
                for (const value of Object.values(newInclude)) {
                    // make sure this is a route and nuthin else
                    if (isClass(value)) {
                        // don't know why i save em
                        const valueInstance = new value()
                        // maybe am down syndrum
                        if (valueInstance instanceof template.Utillity) {
                            // really running out of names😭
                            // old ahh comment fr(only there cuz i copy paste code)
                            valueInstance.startup();
                            let utillityFullPath = routeFile.split(".")[0] + "." + valueInstance.path
                            let pathToList = utillityFullPath.split(".")
                            let currentObj = ""
                            // what the fuck is happening here????
                            // scooby doo ass code(a big fucking mistery)
                            for (let i = 0; i < pathToList.length; i++){
                                if (_.get(utillities, currentObj + pathToList[i]) == undefined) {
                                    if (i == pathToList.length - 1) { 
                                        _.set(utillities, currentObj + pathToList[i], valueInstance)
                                    } else {
                                        _.set(utillities, currentObj + pathToList[i], {})
                                    
                                    }
                                    currentObj += pathToList[i] + "."
                                }
                            }
                            
                        }
                    }
                }
            }
        }
        if (!isFile) {
            await checkDirAndImportUtillities(path + routeFile + "/")
        }
    }
}
var showRoutesOnScreen = true;
async function readConfigs(configJson) {

    const serverPort = configJson["serverSettings"]["port"]
    module.exports = {
        configJSON: configJson,
    }
    if (cluster.isPrimary) {
        logger.announce("--API IS STARTING--")
        logger.announce("Starting server...")
        const numCPUs = availableParallelism();
        logger.announce(`Primary ${process.pid} is running`);
        logger.announce(numCPUs + " avaialable cpu's");
        logger.announce("Default behaviour; using all the cpu's");
        // Fork workers.
        for (let i = 0; i < numCPUs; i++) {
            cluster.fork();
        }

        cluster.on('exit', (worker, code, signal) => {
            logger.announce(`worker ${worker.process.pid} died`);
            // startup new instance
            cluster.fork();
        });
        logger.announce("Started server!");
        logger.announce("Mapping routes...")
        // // map routes
        // const routes = await checkDirAndImportRoutes("./routes/");
        // console.log(routes);
        // i would document this but i forgor how i did this😭
        console.log(await checkDirAndImportRoutes("./routes/"))
        await checkDirAndImportUtillities("./utilities/")
        logger.announce("Mapped routes!")
        logger.announce(" --Master server has started-- ")
    } else {
        // Workers can share any TCP connection
        // In this case it is an HTTP server
        app.listen(serverPort, async function () {
            logger.announce("New server instance started with pid: " + process.pid)
            await checkDirAndImportRoutes("./routes/")
            await checkDirAndImportUtillities("./utilities/")
            customMiddleware.startup(configJson, utillities)
        })
    }


}
fs.readFile("./config.json", "utf8", (err, jsonString) => {
    if (err) {
        logger.announceError("Failed to read config file :(")
    } else {
        readConfigs(JSON.parse(jsonString))
    }
})

function getValueByPartialKey(objectToSearch, partialKey, needFullKey) {
    for (const keye in objectToSearch) {
        if (partialKey.includes(keye) || (partialKey + "/").includes(keye)) {
            if (!objectToSearch[keye]["OWN_ALL_CHILD_ROUTES"]) {
                if (partialKey == keye) {
                    return objectToSearch[keye];
                } else {
                    return {}
                }
            } else {
                return objectToSearch[keye];
            }
        }
    }
    // Return null or handle the case where no match is found
    return {};
}

exports.getRouteDetails = function (routePath) {
    let final = getValueByPartialKey(extraRouteDetails, routePath)
    return final
}



// function caca() {
// fs.readdir("./node_modules", function (err, dirs) {
//     if (err) {
//     console.log(err);
//     return;
//     }
//     dirs.forEach(function(dir){
//     if (dir.indexOf(".") !== 0) {
//         var packageJsonFile = "./node_modules/" + dir + "/package.json";
//         if (fs.existsSync(packageJsonFile)) {
//         fs.readFile(packageJsonFile, function (err, data) {
//             if (err) {
//             console.log(err);
//             }
//             else {
//             var json = JSON.parse(data);
//             console.log('"'+json.name+'": "' + json.version + '",');
//             }
//         });
//         }
//     }
//     });

// });
// }
// caca();