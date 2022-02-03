let peerConnection;
const config = {
  iceServers: [
      { 
        "urls": "stun:stun.l.google.com:19302",
      },
      // { 
      //   "urls": "turn:TURN_IP?transport=tcp",
      //   "username": "TURN_USERNAME",
      //   "credential": "TURN_CREDENTIALS"
      // }
  ]
};

const socket = io.connect(window.location.origin);
const video = document.querySelector("video");


socket.on("offer", (id, description) => {
  peerConnection = new RTCPeerConnection(config);
  peerConnection
    .setRemoteDescription(description)
    .then(() => peerConnection.createAnswer())
    .then(sdp => peerConnection.setLocalDescription(sdp))
    .then(() => {
      socket.emit("answer", id, peerConnection.localDescription);
    });
  peerConnection.ontrack = event => {
    link();
    video.srcObject = event.streams[0];
  };
  peerConnection.onicecandidate = event => {
    if (event.candidate) {
      socket.emit("candidate", id, event.candidate);
    }
  };
});


socket.on("candidate", (id, candidate) => {
  peerConnection
    .addIceCandidate(new RTCIceCandidate(candidate))
    .catch(e => console.error(e));
});

socket.on("connect", () => {
  socket.emit("watcher");
});

socket.on("broadcaster", () => {
  socket.emit("watcher");
});

function enableAudio() {
  console.log("Enabling audio")
  video.muted = false;
}
function link() {

  var newVideo = document.createElement('a-video');
  newVideo.setAttribute('height', '9');
  newVideo.setAttribute('width', '16');
  newVideo.setAttribute('position', '0 5 -15');
  console.log('ATTACH NOW');
  var newParent = document.getElementsByClassName('video-holder');
  newParent[0].appendChild(newVideo);
  
  window.attachNow = function(stream) {
      var video = document.createElement('video');
  
      var assets = document.querySelector('a-assets');
  
      assets.addEventListener('loadeddata', () => {
      console.log('loaded asset data');
      })
  
      video.setAttribute('id', 'newStream');
      video.setAttribute('autoplay', true);
      video.setAttribute('src', '');
      assets.appendChild(video);
  
      video.addEventListener('loadeddata', () => {
      video.play();
  
      // Pointing this aframe entity to that video as its source
      newVideo.setAttribute('src', `#newStream`);
      });
  
      video.srcObject = streams[0];
  }
}