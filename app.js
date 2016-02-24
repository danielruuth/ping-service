
/*
* Settings
* Leave smtp settigns blank for omitting e-mail function
*/

var smtp = {
	"host":"",
	"user": "",
	"password": ""
}

//Load settings from external file
var hosts = require( __dirname + '/hosts.json');


//Packages
var ping = require('ping');
var nodemailer = require('nodemailer');
var express = require('express');
var nodemailer = require('nodemailer');

var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);


//Setup express
app.use(express.static('static'));
app.get('/', function (req, res) {
  res.sendFile(__dirname + '/views/index.html');
});

server.listen(3000, function(){
  console.log('listening on *:3000');
});




var lastupdated = new Date();
var incident_time;



//Setup socket
io.on('connection', function(socket){
	socket.emit('data', {hosts:hosts});
});


//Setup mail
if( smtp.host !== "" ){
	var transporter = nodemailer.createTransport('smtps://'+ smtp.user +':'+ smtp.password +'@' + smtp.host);

	var mailOptions = {
	    from: 'Ping Service <daniel.ruuth@gmail.com>',
	    to: 'unset', // list of receivers
	    subject: 'Pingservice', // Subject line
	    text: '' // plaintext body
	};
}




var checkStatus = function(){
	var currentStatus, sendMail, message;

	hosts.forEach(function(host){
	    ping.sys.probe(host.host, function(isAlive){
	        //var msg = isAlive ? 'host ' + host.host + ' is alive' : 'host ' + host.host + ' is dead';
	        //console.log(msg);

	        currentStatus = isAlive;
	        
	        statusChanged = false;

	        if( currentStatus != host.status && isAlive === false ){
	        	message = 'Host ' + host.host + ' is down.';
	        	statusChanged = true;
	        }else if( currentStatus != host.status && isAlive === true ){
	        	message = 'Host ' + host.host + ' is back up.';
	        }

	        host.status = isAlive;

	        if(statusChanged){
	        	incident_time = new Date().getTime();
	        	io.emit('statusChanged', { id: host.id, host: host.host, status: host.status, incident_start: incident_time });
	        	host.incident_start = incident_time;
	        	
	        	if(transporter){
	        		mailOptions.text = message;
	        		mailOptions.to = host.contact;

		        	transporter.sendMail(mailOptions, function(error, info){
					    if(error){
					    	console.log(error);
					        return;
					    }
					});
		        }
	        }

	    });
	});
	lastupdated = new Date();

}

setInterval( checkStatus, 60000 );
console.log( 'Pingservice is running on ' + hosts.length + ' hosts' );

