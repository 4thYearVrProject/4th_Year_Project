// Selects HTML video player and the input selection dropdowns.
const videoElementLeft = document.getElementById("videoLeft")
const videoElementRight = document.getElementById("videoRight")
const videoSelectLeft = document.querySelector("select#videoSourceLeft");
const videoSelectRight = document.querySelector("select#videoSourceRight");

// Get left camera
getStreamLeft().then(getDevices).then(gotDevices);

// Get Right camera
getStreamRight()

// On input selection changes, reloads the stream
videoSelectLeft.onchange = getStreamLeft;

// On input selection changes, reloads the stream
videoSelectRight.onchange = getStreamRight;

/**
 * Gets the required media devices, then runs gotStream
 *
 * @return returns a promise of the stream
 */
function getStreamLeft() {
  //Unloads previously used track sources
  if (window.stream) {
    window.stream.getTracks().forEach((track) => {
      track.stop();
    });
  }

  // Sets the getUserMedia Constraints
  const videoSource = videoSelectLeft.value;
  const constraints = {
    video: { deviceId: videoSource ? { exact: videoSource } : undefined },
  };

  // Prompts the user for permission to use a media input
  // Then runs gotStream
  return navigator.mediaDevices
    .getUserMedia(constraints)
    .then(gotStreamLeft)
    .catch(handleError);
}

/**
 * Gets the required media devices, then runs gotStream
 *
 * @return returns a promise of the stream
 */
 function getStreamRight() {
  //Unloads previously used track sources
  if (window.stream) {
    window.stream.getTracks().forEach((track) => {
      track.stop();
    });
  }

  // Sets the getUserMedia Constraints
  const videoSource = videoSelectRight.value;
  const constraints = {
    video: { deviceId: videoSource ? { exact: videoSource } : undefined },
  };

  // Prompts the user for permission to use a media input
  // Then runs gotStream
  return navigator.mediaDevices
    .getUserMedia(constraints)
    .then(gotStreamRight)
    .catch(handleError);
}

/**
 * Sends the stream to the HTML
 *
 * @param stream the stream to be played onto the HTML
 */
function gotStreamLeft(stream) {
  videoElementLeft.srcObject = stream;
  window.stream = stream;
  videoSelectLeft.selectedIndex = [...videoSelectLeft.options].findIndex(
    (option) => option.text === stream.getVideoTracks()[0].label
  );
  //socket.emit("broadcaster");
}

/**
 * Sends the stream to the HTML
 *
 * @param stream the stream to be played onto the HTML
 */
 function gotStreamRight(stream) {
   videoElementRight.srcObject = stream;
   window.stream = stream;
   videoSelectRight.selectedIndex = [...videoSelectRight.options].findIndex(
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
 * looks for the video devices from all devices 
 *
 * @param deviceInfos a list of devices
 */
function gotDevices(deviceInfos) {
  window.deviceInfos = deviceInfos;
  for (const deviceInfo of deviceInfos) {
    fillSelector(deviceInfo, videoSelectLeft);
    fillSelector(deviceInfo, videoSelectRight);

  }
}

/**
 * Populates the HTML selection dropdowns
 * 
 * @param deviceInfo  the video device being added
 * @param selector the videoselector that the option will be added too
 */
function fillSelector(deviceInfo, selector){
  const option = document.createElement("option");
  option.value = deviceInfo.deviceId;
  if (deviceInfo.kind === "videoinput") {
    option.text = deviceInfo.label || `Camera ${selector.length + 1}`;
    selector.appendChild(option);
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
