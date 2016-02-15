
/*
* Settings
* Leave smtp settigns blank for omitting e-mail function
*/

var smtp = {
	"host":"",
	"user": "",
	"password": ""
}


//Packages
var ping = require('ping');
var express = require('express');
var mongo = require('mongodb');
var nodemailer = require('nodemailer');



var Server = mongo.Server,
    Db = mongo.Db,
    BSON = mongo.BSONPure;

var dBserver = new Server('localhost', 27017, {auto_reconnect: true});
db = new Db('pingback_service', dBserver);

db.open(function(err, db) {
    if(!err) {
        console.log("Connected to 'hoyservice_collections' database");
    }
});

var app = express();


var hosts = [
	{"host":'domain.com', "status":true, "contact":"email@domain.com"}
];

//Setup mail
if( smtp.host !== "" ){
	var transporter = nodemailer.createTransport('smtps://'+ smtp.user +':'+ smtp.password +'@' + smtp.host);
}

var mailOptions = {
    from: 'Ping Service <user@domain.com>',
    to: 'unset', // list of receivers
    subject: 'Pingservice', // Subject line
    text: '' // plaintext body
};

var saveStatusToDB = function( where, data ){
	db.collection( 'pingback_status' , function(err, collection) {
        collection.update(where, { $set: data} , {upsert:true, multi:false, safe:true}, function(err, result) {
            if (err) {
                console.log({'error':'An error has occurred'});
            }
        });
    });
}


var checkStatus = function(){
	var currentStatus, sendMail;

	hosts.forEach(function(host){
	    ping.sys.probe(host.host, function(isAlive){
	        //var msg = isAlive ? 'host ' + host.host + ' is alive' : 'host ' + host.host + ' is dead';
	        //console.log(msg);

	        currentStatus = isAlive;
	        mailOptions.to = host.contact;
	        statusChanged = false;

	        if( currentStatus != host.status && isAlive === false ){
	        	console.log( 'Host ' + host.host + ' is down.' );

	        	
	        	mailOptions.text = 'Host ' + host.host + ' is down.';
	        	statusChanged = true;

	        	//Send mail to say service is down
	        }else if( currentStatus != host.status && isAlive === true ){
	        	console.log('Host ' + host.host + ' is back up.');

	        	//Send mail to say service is back up
	        	mailOptions.text = 'Host ' + host.host + ' is back up.';
	        	statusChanged = false;
	        	
	        }

	        host.status = isAlive;

	        if(statusChanged){
	        	saveStatusToDB( {"host": host.host}, {"status": host.status, "incident_start": new Date().getTime()  } )
	        	
	        	if(transporter){
		        	transporter.sendMail(mailOptions, function(error, info){
					    if(error){
					        return console.log(error);
					    }
					});
		        }else{
		        	console.log( mailOptions.text  );
		        }
	        }

	    });
	});

}

var listCurrentStatus = function(){
	var router = express.Router();

	res.render('index', { title: 'Express' });

}

setInterval( checkStatus, 60000 );
console.log( 'Pingservice is running on ' + hosts.length + ' hosts' )


//General collections
app.get('/status/', listCurrentStatus);



app.listen(3000);
