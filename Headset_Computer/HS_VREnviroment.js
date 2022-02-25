import * as THREE from '../Open_Source_Code/three.js/build/three.module.js';
import { VRButton } from '../Open_Source_Code/three.js/VRButton.js';
import { XRControllerModelFactory } from '../Open_Source_Code/three.js/XRControllerModelFactory.js';
import '../Headset_Computer/HS_Connection.js';
//import WebXRPolyfill from './js/third-party/webxr-polyfill/build/webxr-polyfill.module.js';

class VREnviroment {
    constructor() {
        const container = document.getElementById('container');
        container.addEventListener('click', function () {
            video.play();
        });

        this.camera = new THREE.PerspectiveCamera(
            70,
            window.innerWidth / window.innerHeight,
            1,
            2000
        );
        this.camera.layers.enable(1);

        this.scene = new THREE.Scene();

        // Gets video from the html, and converts it to a mesh
        const video = document.getElementById('Video');
        video.play();
        const texture = new THREE.VideoTexture(video);
        const material = new THREE.MeshBasicMaterial({ map: texture });

        // Creates a mesh of the video, and adds them to the scene
        this.createMesh('left', texture, material);
        this.createMesh('right', texture, material);

        this.renderer = new THREE.WebGLRenderer();
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.xr.enabled = true;
        this.renderer.xr.setReferenceSpaceType('local');

        this.setUpController();

        container.appendChild(this.renderer.domElement);

        const vrButton = document.getElementById('vrButton');
        vrButton.appendChild(VRButton.createButton(this.renderer));

        this.animate();

        window.addEventListener('resize', this.onWindowResize);
    }

    animate() {
        this.renderer.setAnimationLoop(this.update);
    }

    update() {
        this.renderer.render(this.scene, this.camera);
    }

    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();

        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    setUpController() {
        //Setting up the guide lines
        const lineSegments = 10;
        const lineGeometry = new THREE.BufferGeometry();
        const lineGeometryVertices = new Float32Array((lineSegments + 1) * 3);
        lineGeometryVertices.fill(0);
        lineGeometry.setAttribute(
            'position',
            new THREE.BufferAttribute(lineGeometryVertices, 3)
        );
        const lineMaterial = new THREE.LineBasicMaterial({
            color: 0x888888,
            blending: THREE.AdditiveBlending,
        });
        const guideline = new THREE.Line(lineGeometry, lineMaterial);
        const guideLight = new THREE.PointLight(0xffeeaa, 0, 2);
        guideLight.intensity = 1;

        // Get the left controller
        const controllerModelFactory = new XRControllerModelFactory();
        const leftController = this.renderer.xr.getController(0);
        const leftModel = controllerModelFactory.createControllerModel(
            leftController
        );
        leftController.add(leftModel);
        this.scene.add(leftController);
        leftController.add(guideline);
        leftController.addEventListener('select', leftTriggerButtonResponse);
        leftController.addEventListener('squeeze', leftSqueezeButtonResponse);

        // Get the right controller
        const rightController = renderer.xr.getController(1);
        const rightModel = controllerModelFactory.createControllerModel(
            rightController
        );
        rightController.add(rightModel);
        this.scene.add(rightController);
        rightController.add(guideline);
        rightController.addEventListener('select', rightTriggerButtonResponse);
        rightController.addEventListener('squeeze', rightSqueezeButtonResponse);
    }

    createMesh(side, texture, material) {
        const geometry = new THREE.SphereGeometry(500, 60, 40);

        // invert the geometry on the x-axis so that all of the faces point inward
        geometry.scale(-1, 1, 1);

        const uvs = geometry.getAttribute('uv').array;

        for (let i = 0; i < uvs.length; i += 2) {
            uvs[i] = side == left ? uvs[i] * 0.5 : uvs[i] * 0.5 + 0.5;
        }

        const mesh = new THREE.Mesh(geometry, material);
        mesh.rotation.y = -Math.PI / 2;
        layer = side == left ? 1 : 2;
        mesh.layers.set(layer);
        this.scene.add(mesh);
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
