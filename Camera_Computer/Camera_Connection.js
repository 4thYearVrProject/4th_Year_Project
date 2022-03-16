const peerConnections = {};
let numberOfWatchers = 0;
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

socket.on("answer", (id, description) => {
  peerConnections[id].setRemoteDescription(description);
});

// connects a user to the stream
socket.on("watcher", (id) => {
  numberOfWatchers += 1;

  // Creates a new RTC connection to the user
  const peerConnection = new RTCPeerConnection(config);
  peerConnections[id] = peerConnection;

  // Connects the user to the media trackers
  let stream = videoElement.srcObject;
  stream.getTracks().forEach((track) => peerConnection.addTrack(track, stream));

  // Selects the ICE canidate for the RTC connection
  peerConnection.onicecandidate = (event) => {
    if (event.candidate) {
      socket.emit("candidate", id, event.candidate);
    }
  };

  // Sets a listener for when the peer changes connection
  peerConnection.addEventListener("connectionstatechange", (event) => {
    updateConnection(peerConnections[id], numberOfWatchers);
  });

  // Sends the "offer" signal to the peer
  peerConnection
    .createOffer()
    .then((sdp) => peerConnection.setLocalDescription(sdp))
    .then(() => {
      socket.emit("offer", id, peerConnection.localDescription);
    });
});

socket.on("candidate", (id, candidate) => {
  updateConnection(peerConnections[id], numberOfWatchers);
  peerConnections[id].addIceCandidate(new RTCIceCandidate(candidate));
});

socket.on('command', (data) => {
    const command = JSON.parse(data);
    console.log("receive command: ", command)
});

/**
 * On closing the page, closes the all sockets
 */
window.onunload = window.onbeforeunload = () => {
  socket.close();
};

/**
 * Updates the HTML page based on the connection status of given peer
 *
 * @param connection A peer conncection
 * @param numberOfWatchers The number of users connected to the stream
 */
function updateConnection(connection, numberOfWatchers) {
  document.getElementById("numOfWatchers").innerHTML =
    "Number of Watchers: " + numberOfWatchers;
  if (connection.connectionState === "connected") {
    document.getElementById("circle").style.background = "green";
    document.getElementById("connectionStatus").innerHTML =
      connection.connectionState;
  }
  if (connection.connectionState === "connecting") {
    document.getElementById("circle").style.background = "yellow";
    document.getElementById("connectionStatus").innerHTML =
      connection.connectionState;
  }
  if (connection.connectionState === "new") {
    document.getElementById("circle").style.background = "blue";
    document.getElementById("connectionStatus").innerHTML =
      connection.connectionState;
  }
  if (numberOfWatchers === 0) {
    document.getElementById("circle").style.background = "red";
    document.getElementById("connectionStatus").innerHTML =
      connection.connectionState;
  }
}
