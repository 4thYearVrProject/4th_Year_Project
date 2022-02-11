import * as THREE from '../Open_Source_Code/three.js/build/three.module.js';
import { VRButton } from '../Open_Source_Code/three.js/VRButton.js';

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
            //onNoXRDevice();
        } 
    }
    createXRCanvas = async () => {
        this.canvas = document.createElement("canvas");
        document.body.appendChild(this.canvas);
        this.gl = this.canvas.getContext("webgl", {xrCompatible: true});
        this.xrSession.updateRenderState({baseLayer: new XRWebGLLayer(this.xrSession, this.gl)});

    }
    onSessionStarted = async () => {
        this.setupThreeJs();
        this.localReferenceSpace = await this.xrSession.requestReferenceSpace("local");
        this.viewerSpace = await this.xrSession.requestReferenceSpace('viewer');
        // Queue up the next draw request.
        this.xrSession.requestAnimationFrame(this.animate);
      //  this.animate();
        
    }
    setupThreeJs(){
        const container = document.getElementById( 'container' );
			container.addEventListener( 'click', function () {

				video.play();

			} );

        camera = new THREE.PerspectiveCamera( 70, window.innerWidth / window.innerHeight, 1, 2000 );
        camera.layers.enable( 1 );

        scene = new THREE.Scene();

        //Video
        const video = document.getElementById( 'Video' );
        const texture = new THREE.VideoTexture( video );

        //Left
        const geometryLeft = new THREE.SphereGeometry( 500, 60, 40 );
        // invert the geometry on the x-axis so that all of the faces point inward
        geometryLeft.scale( - 1, 1, 1 );

        const uvsLeft = geometryLeft.attributes.uv.array;

		for ( let i = 0; i < uvsLeft.length; i += 2 ) {

			uvsLeft[ i ] *= 0.5;

		}

        const materialLeft = new THREE.MeshBasicMaterial( { map: texture } );

        const meshLeft = new THREE.Mesh( geometryLeft, materialLeft );
        meshLeft.rotation.y = - Math.PI / 2;
		meshLeft.layers.set( 1 ); // display in left eye only
        scene.add( meshLeft );

        // right
		const geometryRight = new THREE.SphereGeometry( 500, 60, 40 );
		geometryRight.scale( - 1, 1, 1 );

		const uvsRight = geometryRight.attributes.uv.array;

		for ( let i = 0; i < uvsRight.length; i += 2 ) {

			uvsRight[ i ] *= 0.5;
			uvsRight[ i ] += 0.5;

		}

		const materialRight = new THREE.MeshBasicMaterial( { map: texture } );

		const meshRight = new THREE.Mesh( geometryRight, materialRight );
		meshRight.rotation.y = - Math.PI / 2;
		meshRight.layers.set( 2 ); // display in right eye only
		scene.add( meshRight );


        //

        this.renderer = new THREE.WebGLRenderer({
            canvas: this.canvas,
            context: this.gl
          });

        this.renderer.setPixelRatio( window.devicePixelRatio );
        this.renderer.setSize( window.innerWidth, window.innerHeight );
        renderer.xr.enabled = true;
		renderer.xr.setReferenceSpaceType( 'local' );
          
        // document.addEventListener( 'pointerdown', this.onPointerDown);
        // document.addEventListener( 'pointermove', this.onPointerMove);
        // document.addEventListener( 'pointerup', this.onPointerUp);
        container.appendChild( renderer.domElement );
        document.body.appendChild( VRButton.createButton( renderer ) );

        window.addEventListener( 'resize', this.onWindowResize);
    }
    animate = ()=>{
        // this.xrSession.requestAnimationFrame(this.animate);
        // const framebuffer = this.xrSession.renderState.baseLayer.framebuffer
        // this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, framebuffer)

        // this.renderer.setFramebuffer(framebuffer);
        // this.renderer.render(scene, camera)
        this.renderer.setAnimationLoop( this.renderer.render(scene, camera) );

    }


    onWindowResize() {

        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();

        this.renderer.setSize( window.innerWidth, window.innerHeight );

    }



}; 
window.app = new VREnviroment();
let camera, scene;
