import {
    PerspectiveCamera,
    Scene,
    Vector3,
    Box3,
    Box3Helper

} from "three";
import { PointerLockControls } from "three/examples/jsm/controls/PointerLockControls.js";

export class Player {

    // ===== CONFIG =====
    height = 1.8;
    width = 0.6;
    eyeHeight = 1.4;
    maxSpeed = 10;
    acceleration = 50;
    jumpForce = 8;
    gravity = 20;
    friction = 10;

    // ===== STATE =====
    velocity = new Vector3();
    direction = new Vector3();
    onGround = false;
    bounds = new Box3();
    boundsHelper = new Box3Helper(this.bounds, 0xffff00);

    moveForward = false;
    moveBackward = false;
    moveLeft = false;
    moveRight = false;

    camera: PerspectiveCamera;
    controls: PointerLockControls;

    constructor(scene: Scene) {
        this.camera = new PerspectiveCamera(
            70,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );

        this.camera.position.set(10, 15, 10);
        scene.add(this.camera);
        scene.add(this.boundsHelper);

        this.controls = new PointerLockControls(
            this.camera,
            document.body
        );

        document.addEventListener("click", () => {
            this.controls.lock();
        });

        document.addEventListener("keydown", this.onKeyDown.bind(this));
        document.addEventListener("keyup", this.onKeyUp.bind(this));
    }

    // ============================
    // INPUT
    // ============================

    onKeyDown(event: KeyboardEvent) {
        switch (event.code) {
            case "KeyW": this.moveForward = true; break;
            case "KeyS": this.moveBackward = true; break;
            case "KeyA": this.moveLeft = true; break;
            case "KeyD": this.moveRight = true; break;

            case "Space":
                if (this.onGround) {
                    this.velocity.y = this.jumpForce;
                    this.onGround = false;
                }
                break;
        }
    }

    onKeyUp(event: KeyboardEvent) {
        switch (event.code) {
            case "KeyW": this.moveForward = false; break;
            case "KeyS": this.moveBackward = false; break;
            case "KeyA": this.moveLeft = false; break;
            case "KeyD": this.moveRight = false; break;
        }
    }

    // ============================
    // MOVEMENT LOGIC (NO COLLISION HERE)
    // ============================

    update(delta: number) {

        if (!this.controls.isLocked) return;

        // Reset horizontal direction
        this.direction.set(0, 0, 0);

        const forward = new Vector3();
        const right = new Vector3();

        this.camera.getWorldDirection(forward);
        forward.y = 0;
        forward.normalize();

        right.crossVectors(forward, new Vector3(0, 1, 0)).normalize();

        if (this.moveForward) this.direction.add(forward);
        if (this.moveBackward) this.direction.sub(forward);
        if (this.moveLeft) this.direction.sub(right);
        if (this.moveRight) this.direction.add(right);

        if (this.direction.lengthSq() > 0) {
            this.direction.normalize();

            // Accelerate toward desired direction (less control in the air)
            const acc = this.onGround ? this.acceleration : this.acceleration * 0.5;
            this.velocity.x += this.direction.x * acc * delta;
            this.velocity.z += this.direction.z * acc * delta;
        }

        // Clamp horizontal speed
        const horizontalSpeed = Math.sqrt(
            this.velocity.x * this.velocity.x +
            this.velocity.z * this.velocity.z
        );

        if (horizontalSpeed > this.maxSpeed) {
            const scale = this.maxSpeed / horizontalSpeed;
            this.velocity.x *= scale;
            this.velocity.z *= scale;
        }

        // Apply friction
        const friction = this.onGround ? this.friction : this.friction * 0.5;
        this.velocity.x -= this.velocity.x * friction * delta;
        this.velocity.z -= this.velocity.z * friction * delta;
    }

    // ============================
    // POSITION ACCESSOR
    // ============================

    get position() {
        return this.camera.position;
    }
}