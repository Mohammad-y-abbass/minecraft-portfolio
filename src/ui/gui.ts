import { GUI } from 'three/addons/libs/lil-gui.module.min.js'
import { World } from '../world/world';
import { blocks, resources } from '../world/block';


import { Player } from '../player/player';


export function createGUI(world: World, player: Player) {
    const gui = new GUI();
    gui.add(world.size, 'width', 1, 128, 1);
    gui.add(world.size, 'height', 1, 64, 1);

    const terrainFolder = gui.addFolder('Terrain');
    terrainFolder.add(world.params, 'seed', 0, 1000);
    terrainFolder.add(world.params.terrian, 'scale', 10, 100, 0.1);
    terrainFolder.add(world.params.terrian, 'magnitude', 0, 1, 0.01);
    terrainFolder.add(world.params.terrian, 'offset', 0, 1, 0.01);

    const playerFolder = gui.addFolder('Player');
    playerFolder.add(player, 'maxSpeed', 1, 20, 0.1).name('Max Speed');
    playerFolder.add(player, 'acceleration', 1, 100, 1).name('Acceleration');
    playerFolder.add(player, 'jumpForce', 1, 20, 0.1).name('Jump Force');
    playerFolder.add(player, 'gravity', 1, 50, 0.1).name('Gravity');
    playerFolder.add(player, 'friction', 1, 20, 0.1).name('Friction');
    playerFolder.add(player, 'width', 0.1, 2, 0.1).name('Width');
    playerFolder.add(player, 'height', 0.5, 4, 0.1).name('Height');
    playerFolder.add(player, 'eyeHeight', 0.1, 4, 0.1).name('Eye Height');
    playerFolder.add(player.boundsHelper, 'visible').name('Show Bounds');

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
        world.chunks.forEach(chunk => world.remove(chunk));
        world.chunks.clear();
        world.update(player.position);
    });
}