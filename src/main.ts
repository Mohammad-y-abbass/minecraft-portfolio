import { World } from "./world/world";
import Stats from "three/examples/jsm/libs/stats.module.js";
// import { createGUI } from "./ui/gui";
import { createRenderer } from "./core/renderer";
import { setupLights } from "./core/light";
import { Euler, Scene } from "three";
import { Player } from "./player/player";
import { Physics } from "./core/physics";
import { setupInstructions } from "./ui/instructions";
import { PORTFOLIO_DATA } from "./config/portfolio";
import { LabelManager } from "./ui/labels";
import { PosterManager } from "./world/posters";
import { setupMobileControls } from "./ui/mobileControls";

const renderer = createRenderer();


const scene = new Scene();
const world = new World({ width: 32, height: 32 });
scene.add(world);

const player = new Player(scene, world);
player.camera.position.set(0, 15, 10); // Center player

const physics = new Physics();

const stats = new Stats();
document.body.appendChild(stats.dom);

// Labels and Posters (one-time scene objects)
const labelManager = new LabelManager(player);
const posterManager = new PosterManager(scene);

function spawnPortfolioObjects() {
  // Force initial chunk loading around player so ground height is ready for labels/posters
  world.update(player.position);

  Object.entries(PORTFOLIO_DATA).forEach(([_, data]) => {
    const y = world.getGroundHeight(data.x, data.z);

    // Labels stay in scene permanently
    labelManager.addLabel(data.x, y + 4.5, data.z, data.title);

    // Posters stay in scene permanently
    // Plane faces +Z (South) by default.
    const posterRot = new Euler(0, 0, 0);
    posterManager.addPoster(data.x, y + 1.8, data.z - 1.8, posterRot, data.body);
  });
}

spawnPortfolioObjects();

let previousTime = performance.now();

function animate() {
  requestAnimationFrame(animate);
  const currentTime = performance.now();
  const deltaTime = (currentTime - previousTime) / 1000;
  previousTime = currentTime;

  world.update(player.position);
  player.update(deltaTime);
  physics.update(deltaTime, player, world);
  labelManager.update();

  renderer.render(scene, player.camera);
  stats.update();
}

window.addEventListener("resize", () => {
  player.camera.aspect = window.innerWidth / window.innerHeight;
  player.camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

setupLights(scene);
// createGUI(world, player);
setupInstructions(player);
setupMobileControls(player);
animate();