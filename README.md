# TODO:
-- implement user system like in CRM

-- with permisions

-- change manager so it uses the user system

-- add a way for people to use the user system and local database easily

-- fix manager cuz currently it's broken / redo it

-- documentation for the command system in the manager

# expressJS_api_template
 Basic express JS API template for easy use

# how 2 use
* use *npm install* or something like that to install all required packages
* then place ur files inside the routes directory

# example in proc.js
 
* how this shit works:
*   each route is a child class of the route class thats inside template.js
*   inside the constructor you need to pass the route to the parent class using:
*     super(route_name)
*   after you declared the route, you then declare a function with the name GET or POST or PUT or whatever method you want to get called
*   function should be async

*   and you dont need to initiate the class cuz the template will automatically initiate ur class
*   all u need to do is define it
*   also name don't matter
*   multiple clasess can have the same name just make sure that they have different routes
 
# stuff 2 know:
*    -you can access the configs object by using req.configs
*    -you can place files inside folders and it will still work
*    -also each request will like generate a new proccess wich you can access using req.procID
*    -all of the proccesses functionallity is inside procHandler.js so use that to delete proccesses etc..
*    -that's about it have fun
*    -also the api has a manager at url/api/manager
*    it has a login which is set in the config file
*    you also have commands 4 it --- i have to make a tut for them

* *also i'm gonna add logging to discord soon*

# HOW THE LOGGING WORKS
* basically you need to use logger.announce for regular stuff like printing
* it will show up in console & log files
* you can pass it the req parameter so that it also logs the ip of the guy who sent the request :)

* for errors use logger.announceError
* you can pass it the req parameter so that it also logs the ip of the guy who caused the error

# EXAMPLE WORKING ROUTE
````
   const logger = require("../logger")
   const procHandler = require("../procHandler")
   const template = require("./template")
   module.exports = { 
    ur_route_name-it_dont_matter: class extends template.Route{
        constructor() {
            // actuall route like for example github.com/CzrCraft where /CzrCraft is the route

            // MAKE SURE THAT YOU HAVE A SLASH AFTER THE ROUTE!!!!
            // THIS WILL SAVE U A LOT OF HEADACHES!!

            const route = "/exampleRoute/"
            // syntax for super(routeName, dynamic routes(save them as purely their name, and without their /:, object that specified the addittional properties listed down below
            super(route);
            // can be accessed using urdomain.com/exampleRoute
            // where ur domain can be ur ip etc...

            // there are also addittional properties that can be passed to the route constructor
            // IGNORE_TOKEN: this route will be accessible without the access token getting specified in the headers
            // OWN_ALL_CHILD_ROUTES: if you want to have something like a dynamic route something/:some
            //                       this will make so that any route that is a child of this route will have the same properties
            // DONT_LOG_ACCESS: if you don't want this route to save to logs when it gets accessed. Any custom logging will be saved, only the default logging won't be saved
            // CHECK_COOKIE: when serving web pages, this will make it so it will check the cookie called "accessCookie" with the sha256 of the accessToken
            // COOKIE_FAILURE_CALLBACK: if you have CHECK_COOKIE on, then this function will be called when someone has the wrong cookie/no cookies
        }
        // any HTTP method can be declared here with the following syntax
        async GET(req, res) {
            try {
                // if the operation the request is doing doesn't need loading or lookup at a later time you should delete the proccess
                // if you have an operation that does require look up at a later time you can use get proc status(look in proc.js route file)
                logger.announnce("hello am doing someting")
                // like this
                procHandler.deleteProc(req.procID);
            } catch (err) {
                logger.announceError(err)
                res.sendStatus(400)
            }
        }
    },
   }
````
# CONFIGS
i'm gonna add ssl certificate support soon
````
{
    "serverSettings": {
        "port": the port you want the api to be(leave blank for default),
        "auth": {
            "accessToken": "this is used for authetification, specified in token header on request",
            "managerUser": "for the web GUI",
            "managerPassword": "for the web GUI"
        },
        "logger": {
            "logToDiscord": false,
            "botName": "your bots name(this is how it's going to appear on discord",
            "botIcon": "it's icon",
            "infoAndErrorWebhook": "the webhook links which will be used to send messages",
            "errorOnlyWebhook": "the webhook links which will be used to send messages"
        }
    },
    "customSettings": {
       "test": "here you can put any setting you want, and acces it using req.configs
    }
}
````
