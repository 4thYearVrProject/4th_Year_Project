const express = require("express");
const app = express();

let broadcaster;
const port = 4040;
const udpPort = 4444;
const host = '127.0.0.1';
const dgram = require('dgram');

var client = dgram.createSocket('udp4');


const https = require("https");
const fs = require('fs');
const options = {
	key: fs.readFileSync('key.pem'),
	cert: fs.readFileSync('cert.pem')
};
const server = https.createServer(options, app);

const io = require("socket.io")(server);
app.use(express.static(__dirname));

io.sockets.on("error", e => console.log(e));
io.sockets.on("connection", socket => {
  socket.on("broadcaster", () => {
    broadcaster = socket.id;
    socket.broadcast.emit("broadcaster");
  });
  socket.on("watcher", () => {
    socket.to(broadcaster).emit("watcher", socket.id);
  });
  socket.on("offer", (id, message) => {
    socket.to(id).emit("offer", socket.id, message);
  });
  socket.on("answer", (id, message) => {
    socket.to(id).emit("answer", socket.id, message);
  });
  socket.on("candidate", (id, message) => {
    socket.to(id).emit("candidate", socket.id, message);
  });
  socket.on("disconnect", () => {
    socket.to(broadcaster).emit("disconnectPeer", socket.id);
  });
  socket.on("message", (message) => {
    socket.to(broadcaster).emit("message", message);
  });
  socket.on("command", (command) => {
    socket.to(broadcaster).emit("command", command);
    // var message = new Buffer('I am Thor!');
    console.log("received command: ", command)
    //send to udp port 4444
    var message = new Buffer(JSON.stringify(command));
    client.send(message, 0, message.length, udpPort, host, function(err, bytes) {

      if (err) throw err;
      console.log('UDP client message sent to ' + host +':'+ udpPort);
    });
  });
});
server.listen(port, () => console.log(`Server is running on port ${port}`));
