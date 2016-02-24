# ping-service
A simple uptime monitor written in node js.

## Usage
Update the hosts.json file to match the domains you want to monitor and run the app.
	
	forever start app.js

This will startup the service for monitoring and output the result to localhost. To enable e-mail notification just add your smtp details in the top of the app.js file.
