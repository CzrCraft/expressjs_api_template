const fs = require("fs")
let configs;
let infoAndError;
let errorOnly;
const { Webhook } = require('discord-webhook-node');
var Bottleneck = require("bottleneck/es5");
let infoHook;
let errorHook;

const limiter = new Bottleneck({
    minTime: 150
});

function readConfigs() {
    configs = JSON.parse(fs.readFileSync("./config.json", "utf8"))
    console.log(configs)
    infoAndError = configs["serverSettings"]["logger"]["infoAndErrorWebhook"]
    errorOnly = configs["serverSettings"]["logger"]["errorOnlyWebhook"]

    infoHook = new Webhook(infoAndError)
    errorHook = new Webhook(errorOnly)

    infoHook.setUsername(configs["serverSettings"]["logger"]["botName"])
    infoHook.setAvatar(configs["serverSettings"]["logger"]["botIcon"]);
}

readConfigs()

module.exports = {
    sendInfo: async function (message) {
        while (infoAndError == "undefiend") { }
        limiter.schedule(() => {
            infoHook.send(message);
        })
    },
    sendError: async function (message) {
        while (infoAndError == "undefiend") { }
        limiter.schedule(() => {
            infoHook.send(message);
            errorHook.send(message);
        })
    }
}