import * as THREE from '../Open_Source_Code/three.js/build/three.module.js';
import { VRButton } from '../Open_Source_Code/three.js/VRButton.js';
import { XRControllerModelFactory } from '../Open_Source_Code/three.js/XRControllerModelFactory.js';
import '../Headset_Computer/HS_Connection.js';

let renderer, camera, scene, self;

/**
 * The VR Environment is used to render the video from the html streams
 * onto the VR headset. Also renders controllers, maps their inputs, and
 * renders guide lights
 */
class VREnviroment {
    /**
     * Creates a VR Environment that is used to render video from
     * html stream onto the VR headset.
     *
     * @return {VREnviroment}  Returns a VREnvironment
     */
    constructor() {
        self = this;
        const container = document.getElementById('container');
        container.addEventListener('click', function () {
            video.play();
        });

        camera = new THREE.PerspectiveCamera(
            70, // FOV
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
        this.addCameraPosition();

        container.appendChild(renderer.domElement);

        const vrButton = document.getElementById('vrButton');
        vrButton.appendChild(VRButton.createButton(renderer));

        renderer.setAnimationLoop(this.update);

        window.addEventListener('resize', this.onWindowResize);
    }

    /**
     * Renders the scene, is done every frame
     */
    update() {
        self.addCameraPosition();
        renderer.render(scene, camera);
    }

    /**
     * changes the aspect ratio on window resizing
     */
    onWindowResize() {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();

        renderer.setSize(window.innerWidth, window.innerHeight);
    }

    /**
     * Sets up controllers so that they are tracked, inputs are mapped
     * and guidelines are attached
     */
    setUpController() {
        const controllerModelFactory = new XRControllerModelFactory();
        let leftController = this.getController('left', controllerModelFactory);
        let rightController = this.getController(
            'right',
            controllerModelFactory
        );

        let guideline = this.getGuideLine();
        leftController.add(guideline);
        rightController.add(guideline);
    }

    /**
     * gets the controller and maps its buttons to corresponding functions
     *
     * @param  {string} side  The side the controller is on, left or right
     * @param  {ControllerModelFactory} controllerModelFactory
     * @return {Group}   A representation of the controller
     */
    getController(side, controllerModelFactory) {
        const controllerIndex = side == 'left' ? 0 : 1;
        const controller = renderer.xr.getController(controllerIndex);
        const model = controllerModelFactory.createControllerModel(controller);
        controller.add(model);

        controller.addEventListener(
            'select',
            side == 'left'
                ? leftTriggerButtonResponse
                : rightTriggerButtonResponse
        );
        controller.addEventListener(
            'squeeze',
            side == 'left'
                ? leftSqueezeButtonResponse
                : rightSqueezeButtonResponse
        );
        scene.add(controller);
        return controller;
    }

    /**
     * Gets a guideline for displaying on the end of the controller
     * Used for pointing at specific locations with a controller
     *
     * @return {Line}  a THREE.Line that can be attached to a controller
     */
    getGuideLine() {
        const lineSegments = 10;
        const lineGeometryVertices = new Float32Array((lineSegments + 1) * 3);
        const lineGeometry = new THREE.BufferGeometry();
        lineGeometryVertices.fill(0);
        const lineGeometryColors = new Float32Array((lineSegments + 1) * 3);
        lineGeometryColors.fill(0.5);
        lineGeometry.setAttribute(
            'position',
            new THREE.BufferAttribute(lineGeometryVertices, 3)
        );
        lineGeometry.setAttribute(
            'color',
            new THREE.BufferAttribute(lineGeometryColors, 3)
        );
        const lineMaterial = new THREE.LineBasicMaterial({
            color: 0x888888,
            blending: THREE.AdditiveBlending,
        });
        const guideline = new THREE.Line(lineGeometry, lineMaterial);

        return guideline;
    }

    /**
     * Gets a point light that is used to display the
     * location the guidlines meet terrain
     *
     * @return {PointLight}  a THREE.PointLight that highlights a point
     */
    getGuideLight() {
        const guideLight = new THREE.PointLight(0xffffff, 0, 2);
        guideLight.intensity = 1;

        return guideLight;
    }

    /**
     * Adds an arrow to the view that displays the camera position
     */
    addCameraPosition() {
        scene.remove(this.arrowHelper);

        const dir = new THREE.Vector3(-1, 0, 0);

        //normalize the direction vector (convert to vector of length 1)
        dir.normalize();
        let origin = camera.position.clone();
        origin.y = 0;

        const length = 0.8;
        const hex = 0x1aa7ec;

        this.arrowHelper = new THREE.ArrowHelper(dir, origin, length, hex, 0.2, 0.1);
        this.arrowHelper.line.material.linewidth = 3;
        scene.add(this.arrowHelper);
    }

    /**
     * Creates the geometry mesh that will render the video texure around each eye
     *
     * @param  {string} side    the eye the mesh is displayed for, left or right
     * @param  {type} texture   the texture that will be mapped onto the mesh
     */
    createMesh(side, texture) {
        // radius, widthSegments, heightSegments
        const geometry = new THREE.SphereGeometry(200, 60, 40);
        const material = new THREE.MeshBasicMaterial({ map: texture });

        // invert the geometry on the x-axis so that all of the faces point inward
        geometry.scale(-1, 1, 1);

        const uvs = geometry.getAttribute('uv').array;
        for (let i = 0; i < uvs.length; i += 2) {
            uvs[i] = side == 'left' ? uvs[i] * 0.5 : uvs[i] * 0.5; // + 0.5;
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

/**
 *  Functions send messages over socket to camera computer
 */
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

// Runs the VREnvirnment
var vr = new VREnviroment();
