var express = require('express');
var app = express();

app.get('/', function(req, res){
  res.send('잘 보입니꺼~ 크크루 삥빵');
});

var port = 3000;

app.listen(port, function(){
  console.log('Server On! http://localhost: ' + port);
});
