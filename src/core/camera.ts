import { PerspectiveCamera } from "three";

export function createCamera() {
    const camera = new PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(-32, 16, -32);

    return camera
}