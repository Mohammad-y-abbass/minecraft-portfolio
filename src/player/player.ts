import { PointerLockControls } from "three/examples/jsm/controls/PointerLockControls.js";
import { Scene, PerspectiveCamera } from "three";

export class Player {
    maxSpeed = 10;
    camera = new PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 1000);
    controls = new PointerLockControls(this.camera, document.body);

    moveForward = false;
    moveBackward = false;
    moveLeft = false;
    moveRight = false;

    constructor(scene: Scene) {
        this.camera.position.set(10, 10, 5);
        scene.add(this.camera);

        document.addEventListener("keydown", this.onKeyDown.bind(this));
        document.addEventListener("keyup", this.onKeyUp.bind(this));
    }

    update(delta: number) {
        if (!this.controls.isLocked) return;

        if (this.moveForward) this.controls.moveForward(this.maxSpeed * delta);
        if (this.moveBackward) this.controls.moveForward(-this.maxSpeed * delta);
        if (this.moveLeft) this.controls.moveRight(-this.maxSpeed * delta);
        if (this.moveRight) this.controls.moveRight(this.maxSpeed * delta);
    }

    onKeyDown(event: KeyboardEvent) {
        if (!this.controls.isLocked) {
            this.controls.lock();
        }

        switch (event.code) {
            case "KeyW":
                this.moveForward = true;
                break;
            case "KeyS":
                this.moveBackward = true;
                break;
            case "KeyA":
                this.moveLeft = true;
                break;
            case "KeyD":
                this.moveRight = true;
                break;
        }
    }

    onKeyUp(event: KeyboardEvent) {
        switch (event.code) {
            case "KeyW":
                this.moveForward = false;
                break;
            case "KeyS":
                this.moveBackward = false;
                break;
            case "KeyA":
                this.moveLeft = false;
                break;
            case "KeyD":
                this.moveRight = false;
                break;
        }
    }
}