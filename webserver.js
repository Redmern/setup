var http = require('http').createServer(handler); //require http server, and create server with function handler()
var fs = require('fs'); //require filesystem module
var url = require('url');
var path = require('path');
var io = require('socket.io','net')(http) //require socket.io module and pass the http object (server)
var Gpio = require('onoff').Gpio; //include onoff to interact with the GPIO
var GpioPwm = require('pigpio').Gpio;

var powerPin = new Gpio(26, 'out'); //use GPIO pin 26 as output
var dimPin = new GpioPwm(12, {mode: Gpio.OUTPUT});

var GPIO26Value = 1;  // Turn off the LED by default
var GPIO12Value = 0;

/****** CONSTANTS******************************************************/

const WebPort = 80;

/* if you want to run WebPort on a port lower than 1024 without running
 * node as root, you need to run following from a terminal on the pi
 * sudo apt update
 * sudo apt install libcap2-bin
 * sudo setcap cap_net_bind_service=+ep /usr/local/bin/node
 */
 
/*************** Web Browser Communication ****************************/

// Start http webserver
http.listen(WebPort, function() {  // This gets call when the web server is first started.
	powerPin.writeSync(GPIO26Value); //turn LED on or off
	console.log('GPIO26 = '+GPIO26Value);
}); 

// function handler is called whenever a client makes an http request to the server
// such as requesting a web page.
function handler (req, res) { 
    var q = url.parse(req.url, true);
    var filename = "." + q.pathname;
    console.log('filename='+filename);
    var extname = path.extname(filename);
    if (filename=='./') {
		console.log('retrieving default index.html file');
		filename= './index.html';
    }
    
    // Initial content type
    var contentType = 'text/html';
    
    // Check ext and set content type
    switch(extname) {
		case '.js':
			contentType = 'text/javascript';
			break;
		case '.css':
			contentType = 'text/css';
			break;
		case '.json':
			contentType = 'application/json';
			break;
		case '.png':
			contentType = 'image/png';
			break;
		case '.jpg':
			contentType = 'image/jpg';
			break;
		case '.ico':
			contentType = 'image/png';
			break;
    }
    
    fs.readFile(__dirname + '/public/' + filename, function(err, content) {
		if(err) {
			console.log('File not found. Filename='+filename);
			fs.readFile(__dirname + '/public/404.html', function(err, content) {
			res.writeHead(200, {'Content-Type': 'text/html'}); 
			return res.end(content,'utf8'); //display 404 on error
			});
		}
		else {
			// Success
			res.writeHead(200, {'Content-Type': contentType}); 
			return res.end(content,'utf8');
		}
    });
}


// Execute this when web server is terminated
process.on('SIGINT', function () { //on ctrl+c
	powerPin.writeSync(1); // Turn LED off
	powerPin.unexport(); // Unexport LED GPIO to free resources
	dimPin.pwmWrite(0);
	process.exit(); //exit completely
}); 


/****** io.socket is the websocket connection to the client's browser********/

io.sockets.on('connection', function (socket) {// WebSocket Connection
    console.log('A new client has connectioned. Send LED status');
    socket.emit('GPIO26', GPIO26Value);
    
    // this gets called whenever client presses GPIO26 toggle light button
    socket.on('GPIO26T', function(data) { 
		if	(data){
			data = 0
		}
		else data = 1
		if (GPIO26Value) GPIO26Value = 0;
		else GPIO26Value = 1;
		console.log('new GPIO26 value='+GPIO26Value);
		powerPin.writeSync(GPIO26Value); //turn LED on or off
		console.log('Send new GPIO26 state to ALL clients');
		io.emit('GPIO26', GPIO26Value); //send button status to ALL clients 
    });

    // this gets called whenever client presses GPIO26 momentary light button
    socket.on('GPIO26', function(data) { 
		if	(data){
			data = 0
		}
		else data = 1
		GPIO26Value = data;
		if (GPIO26Value != powerPin.readSync()) { //only change LED if status has changed
			powerPin.writeSync(GPIO26Value); //turn LED on or off
			console.log('Send new GPIO26 state to ALL clients');
			io.emit('GPIO26', GPIO26Value); //send button status to ALL clients 
		};	
    });

	socket.on('GPIO12', function(data){
		GPIO12Value = data;
		dimPin.pwmWrite(GPIO12Value);
		io.emit('GPIO12', GPIO12Value)
	});

    //Whenever someone disconnects this piece of code executed
    socket.on('disconnect', function () {
	console.log('A user disconnected');
    });
}); 


 



