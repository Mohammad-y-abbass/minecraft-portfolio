import * as THREE from "three";
import {
    PerspectiveCamera,
    Scene,
    Vector3,
    Box3,
    Box3Helper,
    Raycaster,
    Vector2
} from "three";
import { PointerLockControls } from "three/examples/jsm/controls/PointerLockControls.js";
import { World } from "../world/world";
import { BlockID } from "../world/types";

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
    raycaster = new Raycaster();
    selectedBlockId = BlockID.Grass;
    world: World;

    interactionDistance = 3;
    selectionHelper: THREE.Mesh;
    placementHelper: THREE.Mesh;

    axe = new THREE.Group();
    isSwinging = false;
    swingTimer = 0;
    swingDuration = 0.3;

    // Mobile support
    isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    lookSensitivity = 0.002;
    rotationX = 0;
    rotationY = 0;

    // Axe properties
    axeIdlePos = new Vector3(0.4, -0.4, -0.6);
    axeIdleRot = new THREE.Euler(-Math.PI / 3, Math.PI / 4, 0);

    constructor(scene: Scene, world: World) {
        this.world = world;
        this.camera = new PerspectiveCamera(
            70,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );

        this.camera.position.set(10, 15, 10);
        scene.add(this.camera);
        scene.add(this.boundsHelper);

        // Selection Helper (wireframe)
        const selectionGeometry = new THREE.BoxGeometry(1.01, 1.01, 1.01);
        const selectionMaterial = new THREE.MeshBasicMaterial({
            color: 0xffff00,
            transparent: true,
            opacity: 0.5,
            wireframe: true
        });
        this.selectionHelper = new THREE.Mesh(selectionGeometry, selectionMaterial);
        scene.add(this.selectionHelper);

        // Placement Helper (semi-transparent)
        const placementGeometry = new THREE.BoxGeometry(1, 1, 1);
        const placementMaterial = new THREE.MeshBasicMaterial({
            color: 0x00ff00,
            transparent: true,
            opacity: 0.3
        });
        this.placementHelper = new THREE.Mesh(placementGeometry, placementMaterial);
        scene.add(this.placementHelper);

        this.createAxeModel();
        this.camera.add(this.axe);

        this.controls = new PointerLockControls(
            this.camera,
            document.body
        );

        document.addEventListener("click", (event) => {
            if (!this.controls.isLocked) {
                this.controls.lock();
            } else {
                this.onMouseDown(event);
            }
        });

        // Disable context menu to allow right-click block interaction
        document.addEventListener("contextmenu", (event) => event.preventDefault());

        document.addEventListener("keydown", this.onKeyDown.bind(this));
        document.addEventListener("keyup", this.onKeyUp.bind(this));
    }

    createAxeModel() {
        // Detailed voxel axe
        const handleMat = new THREE.MeshStandardMaterial({ color: 0x5d4037 }); // Darker brown
        const headMat = new THREE.MeshStandardMaterial({ color: 0x757575 });   // Iron gray
        const edgeMat = new THREE.MeshStandardMaterial({ color: 0xeeeeee });   // Sharp silver edge

        // Handle (longer and slightly tilted)
        const handle = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.6, 0.04), handleMat);
        handle.rotation.z = -0.1;
        this.axe.add(handle);

        // Axe Head
        const head = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.15, 0.06), headMat);
        head.position.set(0.06, 0.2, 0);
        this.axe.add(head);

        // Cutting Edge
        const edge = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.2, 0.06), edgeMat);
        edge.position.set(0.13, 0.2, 0);
        this.axe.add(edge);

        // Initial Transform
        this.axe.position.copy(this.axeIdlePos);
        this.axe.rotation.copy(this.axeIdleRot);
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

        if (!this.controls.isLocked) {
            this.selectionHelper.visible = false;
            this.placementHelper.visible = false;
            return;
        }

        this.updateRaycasting();
        this.updateAxeAnimation(delta);

        // Movement logic
        this.direction.set(0, 0, 0);

        const forward = new Vector3();
        const right = new Vector3();

        if (this.controls.isLocked) {
            this.camera.getWorldDirection(forward);
        } else if (this.isTouchDevice) {
            // Manual rotation for touch
            this.camera.rotation.set(this.rotationX, this.rotationY, 0, 'YXZ');
            this.camera.getWorldDirection(forward);
        }

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

    updateAxeAnimation(delta: number) {
        if (this.isSwinging) {
            this.swingTimer += delta;
            if (this.swingTimer > this.swingDuration) {
                this.isSwinging = false;
                this.swingTimer = 0;
            }

            const t = this.swingTimer / this.swingDuration;

            // Easing function: quick out, slow in (cubic)
            const p = 1 - Math.pow(1 - t, 3);

            // Rotation animation (multi-axis)
            this.axe.rotation.x = this.axeIdleRot.x + (Math.PI * 0.8 * Math.sin(t * Math.PI));
            this.axe.rotation.z = this.axeIdleRot.z + (Math.PI * 0.1 * p);
            this.axe.rotation.y = this.axeIdleRot.y - (Math.PI * 0.2 * p);

            // Translation (recoil and thrust)
            this.axe.position.z = this.axeIdlePos.z - (0.3 * Math.sin(t * Math.PI));
            this.axe.position.y = this.axeIdlePos.y - (0.1 * Math.sin(t * Math.PI));
        } else {
            // Smoothly return to idle if not swinging (could add a bit of lerp here too)
            this.axe.position.copy(this.axeIdlePos);
            this.axe.rotation.copy(this.axeIdleRot);
        }
    }

    updateRaycasting() {
        this.raycaster.setFromCamera(new Vector2(0, 0), this.camera);
        const intersections = this.raycaster.intersectObjects(this.world.children, true);

        if (intersections.length > 0 && intersections[0].distance < this.interactionDistance) {
            const intersection = intersections[0];
            const point = intersection.point;
            const normal = intersection.face!.normal;

            // Target block (removal preview)
            const removeX = Math.floor(point.x - normal.x * 0.1);
            const removeY = Math.floor(point.y - normal.y * 0.1);
            const removeZ = Math.floor(point.z - normal.z * 0.1);

            this.selectionHelper.position.set(removeX + 0.5, removeY + 0.5, removeZ + 0.5);
            this.selectionHelper.visible = true;

            // Placement block (addition preview)
            const addX = Math.floor(point.x + normal.x * 0.1);
            const addY = Math.floor(point.y + normal.y * 0.1);
            const addZ = Math.floor(point.z + normal.z * 0.1);

            // Check if placement intersects with player
            const blockBox = new Box3(
                new Vector3(addX, addY, addZ),
                new Vector3(addX + 1, addY + 1, addZ + 1)
            );

            if (this.bounds.intersectsBox(blockBox)) {
                this.placementHelper.visible = false;
            } else {
                this.placementHelper.position.set(addX + 0.5, addY + 0.5, addZ + 0.5);
                this.placementHelper.visible = true;
            }

        } else {
            this.selectionHelper.visible = false;
            this.placementHelper.visible = false;
        }
    }

    onMouseDown(event: MouseEvent) {
        if (!this.controls.isLocked) return;

        this.isSwinging = true;
        this.swingTimer = 0;

        this.raycaster.setFromCamera(new Vector2(0, 0), this.camera);
        const intersections = this.raycaster.intersectObjects(this.world.children, true);

        if (intersections.length > 0 && intersections[0].distance < this.interactionDistance) {
            const intersection = intersections[0];
            const point = intersection.point;
            const normal = intersection.face!.normal;

            if (event.button === 0) { // Left-click: removal
                const x = Math.floor(point.x - normal.x * 0.1);
                const y = Math.floor(point.y - normal.y * 0.1);
                const z = Math.floor(point.z - normal.z * 0.1);
                this.world.setBlock(x, y, z, BlockID.Empty);
            } else if (event.button === 2) { // Right-click: addition
                const x = Math.floor(point.x + normal.x * 0.1);
                const y = Math.floor(point.y + normal.y * 0.1);
                const z = Math.floor(point.z + normal.z * 0.1);

                // Check if placement intersects with player
                const blockBox = new Box3(
                    new Vector3(x, y, z),
                    new Vector3(x + 1, y + 1, z + 1)
                );

                if (!this.bounds.intersectsBox(blockBox)) {
                    this.world.setBlock(x, y, z, this.selectedBlockId);
                }
            }
        }
    }

    // ============================
    // POSITION ACCESSOR
    // ============================

    get position() {
        return this.camera.position;
    }
}