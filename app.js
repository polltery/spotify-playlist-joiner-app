/* jshint esversion: 6*/

// import
const express = require("express");
const app = express();
const port = 3000;

// run the app
app.use(express.static(__dirname + '/docs'));
console.log('Listening on ' + port);
app.listen(port);