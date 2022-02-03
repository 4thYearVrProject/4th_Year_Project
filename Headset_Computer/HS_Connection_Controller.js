function link(scope, element, attrs) {
  var newVideo = document.createElement("a-video");
  newVideo.setAttribute("height", "9");
  newVideo.setAttribute("width", "16");
  newVideo.setAttribute("position", "0 5 -15");
  console.log("ATTACH NOW");
  var newParent = document.getElementsByClassName("video-holder");
  newParent[0].appendChild(newVideo);

  window.attachNow = function (stream) {
    var video = document.createElement("video");

    var assets = document.querySelector("a-assets");

    assets.addEventListener("loadeddata", () => {
      console.log("loaded asset data");
    });

    video.setAttribute("id", "newStream");
    video.setAttribute("autoplay", true);
    video.setAttribute("src", "");
    assets.appendChild(video);

    video.addEventListener("loadeddata", () => {
      video.play();

      // Pointing this aframe entity to that video as its source
      newVideo.setAttribute("src", `#newStream`);
    });

    video.srcObject = stream;
  };
}
activateXR = async () => {
  try {
    // Initialize a WebXR session using "immersive-ar".
    this.xrSession = await navigator.xr.requestSession("immersive-vr");
    // Create the canvas that will contain our camera's background and our virtual scene.
    this.createXRCanvas();

    // With everything set up, start the app.
    await this.onSessionStarted();
  } catch (e) {
    console.log(e);
    onNoXRDevice();
  }
};
onSessionStarted = async () => {
  this.setupThreeJs();
  this.localReferenceSpace = await this.xrSession.requestReferenceSpace(
    "local"
  );
  this.viewerSpace = await this.xrSession.requestReferenceSpace("viewer");
  // Queue up the next draw request.
  this.xrSession.requestAnimationFrame(this.onXRFrame);
};
createXRCanvas = () => {
  this.canvas = document.createElement("canvas");
  document.body.appendChild(this.canvas);
  this.gl = this.canvas.getContext("webgl", { xrCompatible: true });
  this.xrSession.updateRenderState({
    baseLayer: new XRWebGLLayer(this.xrSession, this.gl),
  });
};
onXRFrame = () => {
  this.xrSession.requestAnimationFrame(this.onXRFrame);
  const framebuffer = this.xrSession.renderState.baseLayer.framebuffer;
  this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, framebuffer);
  this.renderer.setFramebuffer(framebuffer);
  this.renderer.render(this.scene, this.camera);
};
setupThreeJs = () => {
  this.renderer = new THREE.WebGLRenderer({
    alpha: true,
    preserveDrawingBuffer: true,
    canvas: this.canvas,
    context: this.gl,
  });
  this.renderer.autoClear = false;
  this.renderer.shadowMap.enabled = true;
  this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  // Initialize our demo scene.
  this.scene = DemoUtils.createLitScene();
  this.camera = new THREE.PerspectiveCamera();
};
