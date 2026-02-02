
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { PerspectiveCamera, WebGLRenderer } from 'three';

export function createControls(camera: PerspectiveCamera, renderer: WebGLRenderer) {
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.target.set(16, 0, 16);
    controls.update();
}