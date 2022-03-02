import * as THREE from '../Open_Source_Code/three.js/build/three.module.js';
import { VRButton } from '../Open_Source_Code/three.js/VRButton.js';
import { XRControllerModelFactory } from '../Open_Source_Code/three.js/XRControllerModelFactory.js';
import '../Headset_Computer/HS_Connection.js';
//import WebXRPolyfill from './js/third-party/webxr-polyfill/build/webxr-polyfill.module.js';
let renderer, camera, scene, self, leftController, rightController;

class VREnviroment {
    constructor() {
        self = this;
        const container = document.getElementById('container');
        container.addEventListener('click', function () {
            video.play();
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
        const video = document.getElementById('Video');
        video.play();
        const texture = new THREE.VideoTexture(video);
        

        // Creates a mesh of the video, and adds them to the scene
        this.createMesh('left', texture);
        this.createMesh('right', texture);

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
        self.addGuideLines(leftController);
        self.addGuideLines(rightController);
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
        leftController = renderer.xr.getController(0);
        const leftModel = controllerModelFactory.createControllerModel(
            leftController
        );
        leftController.add(leftModel);
        
        
        leftController.addEventListener('select', leftTriggerButtonResponse);
        leftController.addEventListener('squeeze', leftSqueezeButtonResponse);

        // Get the right controller
        rightController = renderer.xr.getController(1);
        const rightModel = controllerModelFactory.createControllerModel(
            rightController
        );
        rightController.add(rightModel);
       
        
        rightController.addEventListener('select', rightTriggerButtonResponse);
        rightController.addEventListener('squeeze', rightSqueezeButtonResponse);

        scene.add(rightController);
        scene.add(leftController);
        
    }

    addGuideLines(controller){
        const pointerGeometry = new THREE.BufferGeometry().setFromPoints([
            new THREE.Vector3(0, 0, 0),
            new THREE.Vector3(0, 0, -1),
          ]);
          const line = new THREE.Line(pointerGeometry);
          line.scale.z = 5;
          controller.add(line);
    }

    createMesh(side, texture) {
        const geometry = new THREE.SphereGeometry(200, 60, 40);
        const material = new THREE.MeshBasicMaterial({ map: texture });

        // invert the geometry on the x-axis so that all of the faces point inward
        geometry.scale(-1, 1, 1);

        const uvs = geometry.getAttribute('uv').array;

        for (let i = 0; i < uvs.length; i += 2) {
            uvs[i] = side == 'left' ? uvs[i] * 0.5 : uvs[i] * 0.5;// + 0.5;
        }

        const mesh = new THREE.Mesh(geometry, material);
        mesh.rotation.y = -Math.PI / 2;
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
