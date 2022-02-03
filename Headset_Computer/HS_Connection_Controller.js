class VREnviroment{
    activateXR = async () => {
        try{
        // Initialize a WebXR session using "immersive-ar".
        this.xrSession = await navigator.xr.requestSession("immersive-vr");
        // Create the canvas that will contain our camera's background and our virtual scene.
      this.createXRCanvas();

      // With everything set up, start the app.
      await this.onSessionStarted();
        } catch(e) {
        console.log(e);
        onNoXRDevice();
        }
    }
    onSessionStarted = async () => {
        this.setupThreeJs();
        this.localReferenceSpace = await this.xrSession.requestReferenceSpace("local");
        this.viewerSpace = await this.xrSession.requestReferenceSpace('viewer');
        // Queue up the next draw request.
        this.xrSession.requestAnimationFrame(this.onXRFrame);
    }
    createXRCanvas = async () => {
        this.canvas = document.createElement("canvas");
        document.body.appendChild(this.canvas);
        this.gl = this.canvas.getContext("webgl", {xrCompatible: true});
        this.xrSession.updateRenderState({baseLayer: new XRWebGLLayer(this.xrSession, this.gl)});

    }
    onXRFrame = ()=> {
        this.xrSession.requestAnimationFrame(this.onXRFrame);
        const framebuffer = this.xrSession.renderState.baseLayer.framebuffer
        this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, framebuffer)
        this.renderer.setFramebuffer(framebuffer);
        this.renderer.render(this.scene, this.camera)
    }
    setupThreeJs() {
        this.renderer = new THREE.WebGLRenderer({
          alpha: true,
          preserveDrawingBuffer: true,
          canvas: this.canvas,
          context: this.gl
        });
        this.renderer.autoClear = false;
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    
        // Initialize our demo scene.
        this.scene = DemoUtils.createLitScene();
        this.camera = new THREE.PerspectiveCamera();

    }
}; 
window.app = new VREnviroment();