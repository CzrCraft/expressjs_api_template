# expressJS_api_template
 Basic express JS API template for easy use

# how 2 use
* use *npm install* or something like that to install all required packages
* then place ur files inside the routes directory

# IF YOU STUPID AND DON'T UNDERSTAND GO LOOK in proc.js
 
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
 
* stuff 2 know:
*    -you can access the configs object by using req.configs
*    -you can place files inside folders and it will still work
*    -also each request will like generate a new proccess wich you can access using req.procID
*    -all of the proccesses functionallity is inside procHandler.js so use that to delete proccesses etc..
*    -that's about it have fun

* *also i'm gonna add logging to discord soon*     
