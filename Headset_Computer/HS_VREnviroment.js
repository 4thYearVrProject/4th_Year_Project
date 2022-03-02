import * as THREE from '../Open_Source_Code/three.js/build/three.module.js';
import { VRButton } from '../Open_Source_Code/three.js/VRButton.js';
import { XRControllerModelFactory } from '../Open_Source_Code/three.js/XRControllerModelFactory.js';
import '../Headset_Computer/HS_Connection.js';
//import WebXRPolyfill from './js/third-party/webxr-polyfill/build/webxr-polyfill.module.js';
let renderer, camera, scene;

class VREnviroment {
    constructor() {
        const container = document.getElementById('container');
        container.addEventListener('click', function () {
            videoLeft.play();
        });

        camera = new THREE.PerspectiveCamera(
            70,
            window.innerWidth / window.innerHeight,
            0.1,
            2000
        );
        camera.layers.enable(1);

        scene = new THREE.Scene();

        // Gets video from the html, and converts it to a mesh
        const videoLeft = document.getElementById('VideoLeft');
        videoLeft.play();
        const textureLeft = new THREE.VideoTexture(videoLeft);

        const videoRight = document.getElementById('VideoRight');
        videoRight.play();
        const textureRight = new THREE.VideoTexture(videoRight);
        

        // Creates a mesh of the video, and adds them to the scene
        this.createMesh('left', textureLeft);
        this.createMesh('right', textureRight);

        renderer = new THREE.WebGLRenderer();
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.xr.enabled = true;
        renderer.xr.setReferenceSpaceType('local');

        this.setUpController();

        container.appendChild(renderer.domElement);

        const vrButton = document.getElementById('vrButton');
        vrButton.appendChild(VRButton.createButton(renderer));

        this.animate();

        window.addEventListener('resize', this.onWindowResize);
    }

    animate() {
        renderer.setAnimationLoop(this.update);
    }

    update() {
        renderer.render(scene, camera);
    }

    onWindowResize() {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();

        renderer.setSize(window.innerWidth, window.innerHeight);
    }

    setUpController() {

        // Get the left controller
        const controllerModelFactory = new XRControllerModelFactory();
        const leftController = renderer.xr.getController(0);
        const leftModel = controllerModelFactory.createControllerModel(
            leftController
        );
        leftController.add(leftModel);
        
        
        leftController.addEventListener('select', leftTriggerButtonResponse);
        leftController.addEventListener('squeeze', leftSqueezeButtonResponse);

        // Get the right controller
        const rightController = renderer.xr.getController(1);
        const rightModel = controllerModelFactory.createControllerModel(
            rightController
        );
        rightController.add(rightModel);
       
        
        rightController.addEventListener('select', rightTriggerButtonResponse);
        rightController.addEventListener('squeeze', rightSqueezeButtonResponse);

        //Setting up the guide lines
        const lineSegments=10;
        const lineGeometryVertices = new Float32Array((lineSegments +1) * 3);
        const lineGeometry = new THREE.BufferGeometry();
        lineGeometryVertices.fill(0);
        const lineGeometryColors = new Float32Array((lineSegments +1) * 3);
        lineGeometryColors.fill(0.5);
        lineGeometry.setAttribute('position', new THREE.BufferAttribute(lineGeometryVertices, 3));
        lineGeometry.setAttribute('color', new THREE.BufferAttribute(lineGeometryColors, 3));
        const lineMaterial = new THREE.LineBasicMaterial({ color: 0x888888, blending: THREE.AdditiveBlending });
        const guideline = new THREE.Line( lineGeometry, lineMaterial );
        const guideLight = new THREE.PointLight(0xffffff, 0, 2);
        guideLight.intensity = 1;
        rightController.add(guideline);
        leftController.add(guideline);
        scene.add(rightController);
        scene.add(leftController);
    }

    createMesh(side, texture) {
        // radius, widthSegments, heightSegments
        const geometry = new THREE.SphereGeometry(500, 60, 40);
        //const geometry = new THREE.CylinderGeometry( 10, 10, 18, 32 );
        const material = new THREE.MeshBasicMaterial({ map: texture });
        //const capMaterial = new THREE.MeshBasicMaterial({ color: '0x000000' });

        // invert the geometry on the x-axis so that all of the faces point inward
        geometry.scale(-1, 1, 1);

        const uvs = geometry.getAttribute('uv').array;
        
        for (let i = 0; i < uvs.length; i += 2) {
            uvs[i] = side == 'left' ? uvs[i] * 2.5 : uvs[i] * 2.5; // + 0.5;
        }
        
        const mesh = new THREE.Mesh(geometry, material);
        mesh.rotation.y = -Math.PI / 2;

        // Layers 0 & 1 are rendered for left eye
        // Layers 0 & 2 are rendered for right eye
        let layer = side == 'left' ? 1 : 2;
        mesh.layers.set(layer);
        scene.add(mesh);
    }
}
function leftTriggerButtonResponse() {
    sendMessage('trigger Button Pressed on left controller');
}
function leftSqueezeButtonResponse() {
    sendMessage('squeeze Button Pressed on left controller');
}
function rightTriggerButtonResponse() {
    sendMessage('trigger Button Pressed on right controller');
}
function rightSqueezeButtonResponse() {
    sendMessage('squeeze Button Pressed on right controller');
}
var vr = new VREnviroment();
