import { GUI } from 'three/addons/libs/lil-gui.module.min.js'
import { World } from '../world/world';
import { RNG } from '../world/rng';
import { blocks, resources } from '../world/block';


export function createGUI(world: World) {
    const gui = new GUI();
    gui.add(world.size, 'width', 1, 128, 1);
    gui.add(world.size, 'height', 1, 64, 1);

    const terrainFolder = gui.addFolder('Terrain');
    terrainFolder.add(world.params, 'seed', 0, 1000);
    terrainFolder.add(world.params.terrian, 'scale', 10, 100, 0.1);
    terrainFolder.add(world.params.terrian, 'magnitude', 0, 1, 0.01);
    terrainFolder.add(world.params.terrian, 'offset', 0, 1, 0.01);

    const scaleFolder = gui.addFolder('Scale');
    resources.forEach(resource => {
        const resourceScale = scaleFolder.addFolder(resource.name);
        resourceScale.add(blocks[resource.id].scale, 'x', 1, 100, 0.1).name('Scale X');
        resourceScale.add(blocks[resource.id].scale, 'y', 1, 100, 0.1).name('Scale Y');
        resourceScale.add(blocks[resource.id].scale, 'z', 1, 100, 0.1).name('Scale Z');
    });

    const resourceFolder = gui.addFolder('Resource');
    resources.forEach(resource => {
        resourceFolder.add(blocks[resource.id], 'scarsity', 0, 1, 0.01).name(`${resource.name} Scarcity`);
    });

    gui.onChange(() => {
        world.initTerrian();
        world.generateTerrain(new RNG(world.params.seed));
        world.generateResources(new RNG(world.params.seed));
        world.generateMeshes();
    });
}