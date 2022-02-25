const express = require("express");
const app = express();

let broadcaster;
const port = 4040;

const https = require("https");
const fs = require('fs');
const options = {
	key: fs.readFileSync('certs/server/server.key'),
	cert: fs.readFileSync('certs/server/server.crt'),
  ca: fs.readFileSync('certs/ca/ca.crt'),
  requestCert: true,
  rejectUnauthorized: false
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
});
server.listen(port, () => console.log(`Server is running on port ${port}`));