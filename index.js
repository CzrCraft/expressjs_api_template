
const express = require("express");
const app = express();
const fs = require("fs")
const logger = require("./logger")
const customMiddleware = require("./middleware")
const template = require("./routes/template")
const cookieParser = require("cookie-parser")
let extraRouteDetails = {}
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }))
app.use(customMiddleware)
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

async function checkDirAndImport(path) {
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
                            let extraDetails = {
                                route: "/api/" + valueInstance.path,
                                content: {}
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
                        } else if (valueInstance instanceof template.UtilitiesFunction) {
                            valueInstance.startup()
                            result.push(valueInstance);
                        }
                    }
                }
            }
        }
        if (!isFile) {
            const output = await checkDirAndImport(path + routeFile + "/")
            result = result.concat(output);
        }
    }
    return result;
}

async function readConfigs(configJson) {
    const serverPort = configJson["serverSettings"]["port"]
    module.exports = {
        configJSON: configJson,
    }
    logger.announce("Mapping routes...")
    // map routes
    const routes = await checkDirAndImport("./routes/");
    console.log(routes);
    // i would document this but i forgor how i did this😭
    logger.announce("Mapped routes!")
    logger.announce("Starting server...")
    var server = app.listen(serverPort, function () {
        logger.announce("Server has started on port " + serverPort)
    })
}
logger.announce("---THE API IS STARTING--")
fs.readFile("./config.json", "utf8", (err, jsonString) => {
    if (err) {
        logger.announceError("Failed to read config file :(")
    } else {
        logger.announce("Read config file!")
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



function caca() {
fs.readdir("./node_modules", function (err, dirs) {
    if (err) {
    console.log(err);
    return;
    }
    dirs.forEach(function(dir){
    if (dir.indexOf(".") !== 0) {
        var packageJsonFile = "./node_modules/" + dir + "/package.json";
        if (fs.existsSync(packageJsonFile)) {
        fs.readFile(packageJsonFile, function (err, data) {
            if (err) {
            console.log(err);
            }
            else {
            var json = JSON.parse(data);
            console.log('"'+json.name+'": "' + json.version + '",');
            }
        });
        }
    }
    });

});
}
caca();