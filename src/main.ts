import * as THREE from "three";
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { World } from "./world/world";
import Stats from "three/examples/jsm/libs/stats.module.js";
import { createGUI } from "./ui/gui";


const renderer = new THREE.WebGLRenderer();
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0x80a0e0);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.body.appendChild(renderer.domElement);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(-32, 16, -32);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.target.set(16, 0, 16);
controls.update();

const scene = new THREE.Scene();
const world = new World({ width: 32, height: 16 });
scene.add(world);

const stats = new Stats();
document.body.appendChild(stats.dom);
function setupLights() {
  const sun = new THREE.DirectionalLight();
  sun.position.set(50, 50, 50);

  sun.castShadow = true;
  sun.shadow.camera.left = -50;
  sun.shadow.camera.right = 50;
  sun.shadow.camera.top = 50;
  sun.shadow.camera.bottom = -50;
  sun.shadow.camera.near = 0.1;
  sun.shadow.camera.far = 100;
  sun.shadow.bias = -0.005;
  sun.shadow.mapSize = new THREE.Vector2(512, 512)
  scene.add(sun);


  const light3 = new THREE.AmbientLight();
  light3.intensity = 0.1;
  scene.add(light3);
}



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
setupLights();
createGUI(world);
animate();