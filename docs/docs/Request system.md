->This file is the documentation for the routing/request system

->This system can be broken down to two parts, the networking part and the logging part.

# The networking part
->This is the simpler part, as most of it is taken cared of by the ExpressJS library.
### 1. Startup
-> When the API starts, it searches through the routes directory and imports every JavaScript file.
-> When a valid file is found, it looks through every export of the file and finds child-classes of the class Route(stored in template.js)
-> It hooks that path to ExpressJS, and each of the functions(eg. GET, POST, etc..) to the specific methods for the route.
-> Each route has additional options that let developers integrate features faster.
	->IGNORE_TOKEN: request can be made without a token
	->OWN_ALL_CHILD_ROUTES: this is for dynamic paths(eg. when hosting a file sharing service and this is the download url). If this is enabled all the options from the parent path get applied to it's children
	->DONT_LOG_ACCESS: if a route gets periodically called and you don't care about logging it's access, enable this
	->CHECK_COOKIE: if a route is meant to be accessed by a browser, you can make the middleware check the cookie for auth instead of a token
	->COOKIE_FAILURE_CALLBACK: when a route with the CHECK_COOKIE is requested but the provided cookie is invalid the function assigned to COOKIE_FAILURE_CALLBACK is called.
	->RESTRICTED: if this is enabled, then a valid security token must be provided when the request is made.
-> The main server instance doesn't start an HTTP server, only it's children
-> For debugging purposes the imported routes are printed to the console but not logged.
### 2. Runtime
-> At runtime the routes are already "hooked" so for example a request to api/foobar with method GET will call the routes GET function
-> Middleware does it's job and checks requests before passing them on.
-> The middleware also adds a few extra headers to the req object.[[Middleware]]

# The logging part
-> the logging part is a bit more complicated, as it handles the logging of a requests result.
-> It has a few jobs:
	->Keeps track of requests and saves them to disk.
	->Reads a requests statuses from disk/memory and returns them

### 1. Keeping track of requests
->The request system creates a new request internally every time a succsesfull request is made.
->Each request has a status and adittional info.
->When a request is handled, it's ID is placed by the middleware inside the reqID property of the req object.
