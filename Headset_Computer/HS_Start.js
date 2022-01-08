// Prefer camera resolution nearest to 1280x720.
var constraints = { audio: true, video: true };

navigator.mediaDevices.getUserMedia(constraints)
.then(function(mediaStream) {
  var video = document.querySelector('video');
  video.srcObject = mediaStream;
})
.catch(function(err) { console.log(err.name + ": " + err.message); }); // always check for errors at the end.

function update(stream) {
    document.querySelector('video').src = stream.url;
}