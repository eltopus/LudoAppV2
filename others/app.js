var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');


var app = express();
var http = require('http').createServer(app);
var io = require('socket.io')(http);
var ldx = require('./ludosocket');
var debug = require('debug');

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());


app.use('/phaser', express.static(__dirname + '/node_modules/phaser/build/'));
app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use('/dist', express.static(path.join(__dirname, '/dist')));
app.use('/images', express.static(path.join(__dirname, '/images')));
app.use('/js', express.static(path.join(__dirname, '/public/js')));
app.use('/css', express.static(path.join(__dirname, '/public/css')));

app.get('/setup', function (req, res) {
    res.sendFile(path.join(__dirname + '/views/setup.html'));
});

app.get('/', function (req, res) {
    res.sendFile(path.join(__dirname + '/views/index.html'));
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});

io.on('connection', function(socket){
	debug('Listening on ' + socket.id);
  ldx.LudoSocket(io, socket);
});

var port = normalizePort(process.env.PORT || '3000');
app.set('port', port);

http.listen(port);
http.on('listening', onListening);

function onListening() {
	var addr = http.address();
	var bind = typeof addr === 'string'
		? 'pipe ' + addr
				: 'port ' + addr.port;
	debug('Listening on ' + bind);
	console.log( "Listening on server_port: " + addr.port);
}

function normalizePort(val) {
	var port = parseInt(val, 10);
	if (isNaN(port)) {
		// named pipe
		return val;
	}
	if (port >= 0) {
		// port number
		return port;
	}
	return false;
}


module.exports = app;
