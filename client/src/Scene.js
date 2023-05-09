import * as THREE from "three";
import {OrbitControls} from "three/examples/jsm/controls/OrbitControls";

export default class Scene {
    constructor(canvasID, camera, scene, controls, renderer, fov = 36) {
        this.fov = fov;
        this.scene = scene;
        this.camera = camera;
        this.controls = controls;
        this.renderer = renderer;
        this.canvasID = canvasID;
    }

    initScene() {
        this.camera = new THREE.PerspectiveCamera(
            this.fov + 10,
            window.innerWidth / window.innerHeight,
            1,
            1000
        );
        this.camera.position.z = 1100;

        this.scene = new THREE.Scene();

        // specify a canvas which is already created in the HTML file and tagged by an ID aliasing enabled
        const canvas = document.getElementById(this.canvasID);
        this.renderer = new THREE.WebGLRenderer({
            canvas,
            antialias: true,
        });

        this.renderer.setSize(window.innerWidth, window.innerHeight);

        document.body.appendChild(this.renderer.domElement);

        this.controls = new OrbitControls(this.camera, this.renderer.domElement);

        // if window resizes
        window.addEventListener("resize", () => this.onWindowResize(), false);
    }

    animate() {
        window.requestAnimationFrame(this.animate.bind(this));
        this.render();
        // this.stats.update();
        this.controls.update();
    }

    render() {
        this.renderer.render(this.scene, this.camera);
    }

    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    resetPosition() {
        this.camera.position.x = 0;
        this.camera.position.y = 0;
        this.camera.position.z = 130;
        this.camera.x = 0;
        this.camera.y = 0;
        this.camera.z = 0;
    }

    resetRotation() {
        this.camera.rotation.x = 0;
        this.camera.rotation.y = 0;
        this.camera.rotation.z = 0;
    }
}