var express = require('express');
var path = require('path');
var httpProxy = require('http-proxy');

// We need to add a configuration to our proxy server,
// as we are now proxying outside localhost
var proxy = httpProxy.createProxyServer({
  changeOrigin: true
});
var app = express();

var isProduction = process.env.NODE_ENV === 'production';
var port = isProduction ? process.env.PORT : 3000;
var publicPath = path.resolve(__dirname, 'public');

app.use(express.static(publicPath));

// If you only want this for development, you would of course
// put it in the "if" block below
app.all('/db/*', function (req, res) {
  proxy.web(req, res, {
    target: 'https://glowing-carpet-4534.firebaseio.com'
  });
});

if (!isProduction) {

  var bundle = require('./server/bundle.js');
  bundle();
  app.all('/build/*', function (req, res) {
    proxy.web(req, res, {
        target: 'http://localhost:8080'
    });
  });

}

proxy.on('error', function(e) {
  console.log('Could not connect to proxy, please try again...');
});

app.listen(port, function () {
  console.log('Server running on port ' + port);
});
