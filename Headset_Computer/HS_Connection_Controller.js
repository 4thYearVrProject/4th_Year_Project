import * as THREE from '../Open_Source_Code/three.js/build/three.module.js';
import { VRButton } from '../Open_Source_Code/three.js/VRButton.js';

let camera, scene, renderer;

class VREnviroment{

    setup(){
        const container = document.getElementById( 'container' );
			container.addEventListener( 'click', function () {

				video.play();

			} );

        camera = new THREE.PerspectiveCamera( 70, window.innerWidth / window.innerHeight, 1, 2000 );
        camera.layers.enable( 1 );

        scene = new THREE.Scene();

        //Video
        const video = document.getElementById( 'Video' );
        video.play();
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

        renderer = new THREE.WebGLRenderer();
        renderer.setPixelRatio( window.devicePixelRatio );
        renderer.setSize( window.innerWidth, window.innerHeight );
        renderer.xr.enabled = true;
		renderer.xr.setReferenceSpaceType( 'local' );

        container.appendChild( renderer.domElement );

        const vrButton = document.getElementById( 'vrButton' );
        vrButton.appendChild( VRButton.createButton( renderer ) );

        this.animate()

        window.addEventListener( 'resize', this.onWindowResize);
    }

    animate() {
        renderer.setAnimationLoop(this.update);
    }

    update() {
        renderer.render( scene, camera );
    }

    onWindowResize() {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();

        renderer.setSize(window.innerWidth, window.innerHeight);
    }
}; 
window.app = new VREnviroment();
var vr = new VREnviroment();
vr.setup();


