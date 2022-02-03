// Selects HTML video player and the input selection dropdowns.
const videoElement = document.querySelector("video");
const audioSelect = document.querySelector("select#audioSource");
const videoSelect = document.querySelector("select#videoSource");

// Get camera and microphone
getStream().then(getDevices).then(gotDevices);

// On input selection changes, reloads the stream
audioSelect.onchange = getStream;
videoSelect.onchange = getStream;

/**
 * Gets the required media devices, then runs gotStream
 *
 * @return returns a promise of the stream
 */
function getStream() {
  //Unloads previously used track sources
  if (window.stream) {
    window.stream.getTracks().forEach((track) => {
      track.stop();
    });
  }

  // Sets the getUserMedia Constraints
  const audioSource = audioSelect.value;
  const videoSource = videoSelect.value;
  const constraints = {
    audio: { deviceId: audioSource ? { exact: audioSource } : undefined },
    video: { deviceId: videoSource ? { exact: videoSource } : undefined },
  };

  // Prompts the user for permission to use a media input
  // Then runs gotStream
  return navigator.mediaDevices
    .getUserMedia(constraints)
    .then(gotStream)
    .catch(handleError);
}

/**
 * Sends the stream to the HTML
 *
 * @param stream the stream to be played onto the HTML
 */
function gotStream(stream) {
  videoElement.srcObject = stream;
  window.stream = stream;
  audioSelect.selectedIndex = [...audioSelect.options].findIndex(
    (option) => option.text === stream.getAudioTracks()[0].label
  );
  videoSelect.selectedIndex = [...videoSelect.options].findIndex(
    (option) => option.text === stream.getVideoTracks()[0].label
  );
  socket.emit("broadcaster");
}

/**
 * @return returns a promise of a list of input and output devices
 */
function getDevices() {
  return navigator.mediaDevices.enumerateDevices();
}

/**
 * Populates the HTML selection dropdowns
 *
 * @param deviceInfos a list of devices
 */
function gotDevices(deviceInfos) {
  window.deviceInfos = deviceInfos;
  for (const deviceInfo of deviceInfos) {
    const option = document.createElement("option");
    option.value = deviceInfo.deviceId;
    if (deviceInfo.kind === "audioinput") {
      option.text = deviceInfo.label || `Microphone ${audioSelect.length + 1}`;
      audioSelect.appendChild(option);
    } else if (deviceInfo.kind === "videoinput") {
      option.text = deviceInfo.label || `Camera ${videoSelect.length + 1}`;
      videoSelect.appendChild(option);
    }
  }
}

/**
 * Outputs passed errors to the console
 *
 * @param error the error that is to be reported
 */
function handleError(error) {
  console.error("Error: ", error);
}
