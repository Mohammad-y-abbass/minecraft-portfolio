import { BlockID } from "./types";
import * as THREE from "three";

const textureLoader = new THREE.TextureLoader();

function loadTexture(path: string) {
    const texture = textureLoader.load(path);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.magFilter = THREE.NearestFilter;
    texture.minFilter = THREE.NearestFilter;
    return texture;
}

const textures = {
    grass: loadTexture("textures/grass.png"),
    grass_side: loadTexture("textures/grass_side.png"),
    dirt: loadTexture("textures/dirt.png"),
    stone: loadTexture("textures/stone.png"),
    coal: loadTexture("textures/coal_ore.png"),
    iron: loadTexture("textures/iron_ore.png"),
    wood: loadTexture("textures/tree_side.png"),
    wood_top: loadTexture("textures/tree_top.png"),
    leaves: loadTexture("textures/leaves.png"),
}

export const blocks = {
    [BlockID.Empty]: { name: "Empty", color: 0x000000, materials: null },
    [BlockID.Grass]: {
        name: "Grass", color: 0x00ff00, materials: [
            new THREE.MeshStandardMaterial({ map: textures.grass_side }),
            new THREE.MeshStandardMaterial({ map: textures.grass_side }),
            new THREE.MeshStandardMaterial({ map: textures.grass }),
            new THREE.MeshStandardMaterial({ map: textures.dirt }),
            new THREE.MeshStandardMaterial({ map: textures.dirt }),
            new THREE.MeshStandardMaterial({ map: textures.dirt }),
        ]
    },
    [BlockID.Dirt]: { name: "Dirt", color: 0x8b4513, materials: new THREE.MeshStandardMaterial({ map: textures.dirt }) },
    [BlockID.Stone]: { name: "Stone", color: 0x808080, scale: { x: 30, y: 30, z: 30 }, scarsity: 0.5, materials: new THREE.MeshStandardMaterial({ map: textures.stone }) },
    [BlockID.Coal]: { name: "Coal", color: 0x000000, scale: { x: 20, y: 20, z: 20 }, scarsity: 0.7, materials: new THREE.MeshStandardMaterial({ map: textures.coal }) },
    [BlockID.Iron]: { name: "Iron", color: 0x808080, scale: { x: 60, y: 60, z: 60 }, scarsity: 0.9, materials: new THREE.MeshStandardMaterial({ map: textures.iron }) },
    [BlockID.Wood]: {
        name: "Wood", color: 0x5d4037, materials: [
            new THREE.MeshStandardMaterial({ map: textures.wood }),
            new THREE.MeshStandardMaterial({ map: textures.wood }),
            new THREE.MeshStandardMaterial({ map: textures.wood_top }),
            new THREE.MeshStandardMaterial({ map: textures.wood_top }),
            new THREE.MeshStandardMaterial({ map: textures.wood }),
            new THREE.MeshStandardMaterial({ map: textures.wood }),
        ]
    },
    [BlockID.Leaves]: { name: "Leaves", color: 0x00ff00, materials: new THREE.MeshStandardMaterial({ map: textures.leaves, transparent: true, alphaTest: 0.5 }) },
    [BlockID.Cloud]: { name: "Cloud", color: 0xffffff, materials: new THREE.MeshStandardMaterial({ color: 0xffffff, transparent: true, opacity: 0.8 }) },
    [BlockID.Lamp]: { name: "Lamp", color: 0xffff00, materials: new THREE.MeshStandardMaterial({ color: 0xffffaa, emissive: 0xffffaa, emissiveIntensity: 1 }) },
} as const;

export const resources = [
    { id: BlockID.Stone, name: 'Stone', target: BlockID.Dirt },
    { id: BlockID.Coal, name: 'Coal', target: BlockID.Stone },
    { id: BlockID.Iron, name: 'Iron', target: BlockID.Stone },
]
