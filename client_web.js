const express = require('express');
const fs = require('fs')
const path = require('path')
const app = express()
const server = require('http').Server(app)

var port = process.env.PORT || 8080;

app.use(express.static(path.join(__dirname, "web")));
app.get('/', function (req, res) {
  res.sendFile(path.join(__dirname, "web", 'index.html'));
});

server.listen(port)
console.log("Running on port: " + port);