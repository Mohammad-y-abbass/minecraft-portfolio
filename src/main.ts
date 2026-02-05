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

  Object.entries(PORTFOLIO_DATA).forEach(([key, data]) => {
    const y = world.getGroundHeight(data.x, data.z);

    // Labels stay in scene permanently
    labelManager.addLabel(data.x, y + 4.5, data.z, data.title);

    // Posters stay in scene permanently
    if (key === 'projects' && data.projects) {
      const skyY = 30;
      const posterWidth = 25;
      const posterHeight = 15;

      // 1. Far Left (Angled)
      posterManager.addPoster(
        data.x - 50, skyY, data.z - 5,
        new Euler(0, Math.PI / 3, 0),
        `${data.projects[2].title}\n\n${data.projects[2].desc}`,
        posterWidth, posterHeight
      );

      // 2. Front Left
      posterManager.addPoster(
        data.x - 15, skyY, data.z - 25,
        new Euler(0, 0, 0),
        `${data.projects[0].title}\n\n${data.projects[0].desc}`,
        posterWidth, posterHeight
      );

      // 3. Front Right
      posterManager.addPoster(
        data.x + 15, skyY, data.z - 25,
        new Euler(0, 0, 0),
        `${data.projects[1].title}\n\n${data.projects[1].desc}`,
        posterWidth, posterHeight
      );

      // 4. Far Right (Angled)
      posterManager.addPoster(
        data.x + 50, skyY, data.z - 5,
        new Euler(0, -Math.PI / 3, 0),
        `${data.projects[3].title}\n\n${data.projects[3].desc}`,
        posterWidth, posterHeight
      );

      // 5. Links Poster (Inside the cabin)
      const linksText = `PROJECT LINKS\n\n` + data.projects.map(p => {
        let text = `${p.title}:`;
        if (p.code) text += `\n Code: ${p.code}`;
        if (p.preview) text += `\n Preview: ${p.preview}`;
        return text;
      }).join('\n\n');
      posterManager.addPoster(
        data.x, y + 1.8, data.z - 1.8,
        new Euler(0, 0, 0),
        linksText,
        4, 3
      );
    } else {
      // Regular posters for other sections
      const posterRot = new Euler(0, 0, 0);
      posterManager.addPoster(data.x, y + 1.8, data.z - 1.8, posterRot, data.body);
    }
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