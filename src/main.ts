import * as THREE from "three";
import { World } from "./world/world";
import Stats from "three/examples/jsm/libs/stats.module.js";
import { createGUI } from "./ui/gui";
import { createRenderer } from "./core/renderer";
import { createCamera } from "./core/camera";
import { createControls } from "./core/controls";
import { setupLights } from "./core/light";


const renderer = createRenderer();

const camera = createCamera();

createControls(camera, renderer);


const scene = new THREE.Scene();
const world = new World({ width: 32, height: 16 });
scene.add(world);

const stats = new Stats();
document.body.appendChild(stats.dom);

function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
  stats.update();
}

window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
setupLights(scene);
createGUI(world);
animate();