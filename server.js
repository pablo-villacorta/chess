var express = require('express');
const cors = require('cors');

var app = express();
var server = app.listen(3000);

app.use(cors());
app.options('*', cors());

app.use(express.static('public'));
console.log("server running!");
