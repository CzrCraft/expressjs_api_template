This is meant to serve as a basic form of documentation for aiding developers use it.
The goal of this project is to make an easy to use template/library/cli(in the future), that can be set up in 5 minutes and comes ready to go. It features a lot of boiller-plate components that are easy for beginners to use and developers to abuse. 

The need of this project came from another one of mine, and that's where i realized that getting into api/backend dev. is a messy path, with alot of sleeplessnights.

This project is useful for a lot of applications, from IoT integrations to platform backends.

Main features:
	-> Multi-instance system, can handle a lot of requests
	-> Routing system that's easy to use and very organize [[Request system]]
	-> Utility system which lets developers easily integrate with other API's
	-> Very detailed logging system which saves a lot of very useful information
		-> Logger can also output to discord, but i should rewrite the system as a Winston transport.
	-> Very modular, easy to modify. Hack it!
	-> Custom middleware that includes a default user system with security tokens
