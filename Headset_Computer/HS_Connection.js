let peerConnection;
// The RTC configuration settings
const config = {
  iceServers: [
    {
      urls: "stun:stun.l.google.com:19302",
    },
    // {
    //   "urls": "turn:TURN_IP?transport=tcp",
    //   "username": "TURN_USERNAME",
    //   "credential": "TURN_CREDENTIALS"
    // }
  ],
};

const socket = io.connect(window.location.origin);
const socketPy = io.connect('http://' + window.location.hostname + ':4444');

const videoLeft = document.getElementById("VideoLeft");
const videoRight = document.getElementById("VideoRight");


// Creates the peer side connection after receiving "offer" signal
socket.on("offer", (id, description) => {
  peerConnection = new RTCPeerConnection(config);
  peerConnection
    .setRemoteDescription(description)
    .then(() => peerConnection.createAnswer())
    .then((sdp) => peerConnection.setLocalDescription(sdp))
    .then(() => {
      socket.emit("answer", id, peerConnection.localDescription);
    });
  peerConnection.ontrack = (event) => {
    if(event.transceiver.mid == 0){
      videoLeft.srcObject = event.streams[0];
    }
    else{
      videoRight.srcObject = event.streams[0];
    }
  };
  peerConnection.onicecandidate = (event) => {
    if (event.candidate) {
      socket.emit("candidate", id, event.candidate);
    }
  };
});

// On selection of canidate by host, sets the RTC canidate
socket.on("candidate", (id, candidate) => {
  peerConnection
    .addIceCandidate(new RTCIceCandidate(candidate))
    .catch((e) => console.error(e));
});

// On connection, emits a "watcher" signal to the host
socket.on("connect", () => {
  socket.emit("watcher");
});

// On connection, emits a "watcher" signal to the host
socket.on("broadcaster", () => {
  socket.emit("watcher");
});

/**
 * On closing the page, closes the socket and connection
 */
window.onunload = window.onbeforeunload = () => {
  socket.close();
  peerConnection.close();
};

/**
 * Enables the audio to play
 */
function enableAudio() {
  console.log("Enabling audio");
  videoLeft.muted = false;
}
var count = 0;
function sendCommand(command) {
    console.log("sending command: ", command)
    socket.emit('command', command);
    //socketPy.emit('command', command);
}

