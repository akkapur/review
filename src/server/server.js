var express = require('express'),
	swig = require('swig'),
	http = require('http'),
	port = 3000,
	app;

module.exports = app = express();

swig.setDefaults({
	varControls: ['<%=', '%>'],
	tagControls: ['<%', '%>']
});

app.engine('html', swig.renderFile);
app.set('view engine', 'html');
app.set('views', __dirname + '/views');
app.use('/static', express.static(__dirname + '/../static'));
app.use('/healthcheck', require('./lib/healthcheck'));

app.get('/', function (req, res) {
	res.render('index');
});

app.get('/views/*', function(req, res) {
	res.render(req.params[0]);
});

var server = app.listen(3000, function () {
  var host = server.address().address;
  var port = server.address().port;

  console.log('review app listening at http://%s:%s', host, port);
});