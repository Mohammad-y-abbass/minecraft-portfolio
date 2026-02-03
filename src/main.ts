import { World } from "./world/world";
import Stats from "three/examples/jsm/libs/stats.module.js";
import { createGUI } from "./ui/gui";
import { createRenderer } from "./core/renderer";
import { setupLights } from "./core/light";
import { Scene } from "three";
import { Player } from "./player/player";

const renderer = createRenderer();


const scene = new Scene();
const world = new World({ width: 32, height: 16 });
scene.add(world);

const player = new Player(scene);

const stats = new Stats();
document.body.appendChild(stats.dom);


let previousTime = performance.now();

function animate() {
  requestAnimationFrame(animate);
  const currentTime = performance.now();
  const deltaTime = (currentTime - previousTime) / 1000;
  previousTime = currentTime;
  player.update(deltaTime);
  renderer.render(scene, player.camera);
  stats.update();
}

window.addEventListener("resize", () => {
  player.camera.aspect = window.innerWidth / window.innerHeight;
  player.camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
setupLights(scene);
createGUI(world);
animate();