import { World } from "./world/world";
import Stats from "three/examples/jsm/libs/stats.module.js";
import { createGUI } from "./ui/gui";
import { createRenderer } from "./core/renderer";
import { setupLights } from "./core/light";
import { Scene } from "three";
import { Player } from "./player/player";
import { Physics } from "./core/physics";

const renderer = createRenderer();


const scene = new Scene();
const world = new World({ width: 16, height: 32 });
scene.add(world);

const player = new Player(scene);

const physics = new Physics();

const stats = new Stats();
document.body.appendChild(stats.dom);


let previousTime = performance.now();

function animate() {
  requestAnimationFrame(animate);
  const currentTime = performance.now();
  const deltaTime = (currentTime - previousTime) / 1000;
  previousTime = currentTime;

  world.update(player.position);
  player.update(deltaTime);
  physics.update(deltaTime, player, world);
  renderer.render(scene, player.camera);
  stats.update();
}

window.addEventListener("resize", () => {
  player.camera.aspect = window.innerWidth / window.innerHeight;
  player.camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
setupLights(scene);
createGUI(world, player);
animate();