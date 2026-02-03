import * as THREE from "three";
import { SimplexNoise } from "three/examples/jsm/math/SimplexNoise.js";
import { type WorldData, BlockID } from "./types";
import { blocks, resources } from "./block";
import { RNG } from "./rng";

const geometry = new THREE.BoxGeometry(1, 1, 1);

export class Chunk extends THREE.Group {
    size: { width: number; height: number };
    data: WorldData[][][];
    positionInWorld: { x: number; z: number };
    params: any;

    constructor(x: number, z: number, size: { width: number; height: number }, params: any) {
        super();
        this.positionInWorld = { x, z };
        this.size = size;
        this.params = params;
        this.position.set(x * size.width, 0, z * size.width);
        this.data = [];
        this.initTerrainData();
    }

    initTerrainData() {
        this.data = [];
        for (let x = 0; x < this.size.width; x++) {
            const slice: WorldData[][] = [];
            for (let y = 0; y < this.size.height; y++) {
                const row: WorldData[] = [];
                for (let z = 0; z < this.size.width; z++) {
                    row.push({ id: BlockID.Empty, instanceId: null });
                }
                slice.push(row);
            }
            this.data.push(slice);
        }
    }

    generateTerrain(rng: RNG) {
        const simplex = new SimplexNoise(rng);
        for (let x = 0; x < this.size.width; x++) {
            for (let z = 0; z < this.size.width; z++) {
                const worldX = this.positionInWorld.x * this.size.width + x;
                const worldZ = this.positionInWorld.z * this.size.width + z;

                const value = simplex.noise(
                    worldX / this.params.terrian.scale,
                    worldZ / this.params.terrian.scale
                );

                const scaledNoise = value * this.params.terrian.magnitude + this.params.terrian.offset;
                let height = Math.floor(this.size.height * scaledNoise);
                height = Math.max(1, Math.min(height, this.size.height - 1));

                for (let y = 0; y < this.size.height; y++) {
                    if (y < height) {
                        this.setBlockId(x, y, z, BlockID.Dirt);
                    } else if (y === height) {
                        this.setBlockId(x, y, z, BlockID.Grass);

                        // Randomly grow a tree
                        if (rng.random() < 0.02) {
                            this.generateTree(x, y + 1, z, rng);
                        }
                    } else if (this.getBlock(x, y, z)?.id === BlockID.Empty) {
                        this.setBlockId(x, y, z, BlockID.Empty);
                    }
                }
            }
        }
    }

    generateTree(x: number, y: number, z: number, rng: RNG) {
        const treeHeight = 4 + Math.floor(rng.random() * 3);

        // Trunk
        for (let i = 0; i < treeHeight; i++) {
            this.setBlockId(x, y + i, z, BlockID.Wood);
        }

        // Canopy
        const canopyHeight = 2;
        const canopyRadius = 2;

        for (let cy = 0; cy < canopyHeight; cy++) {
            for (let cx = -canopyRadius; cx <= canopyRadius; cx++) {
                for (let cz = -canopyRadius; cz <= canopyRadius; cz++) {
                    const lx = x + cx;
                    const ly = y + treeHeight - canopyHeight + cy;
                    const lz = z + cz;

                    // Skip the trunk and round the corners
                    if (cx === 0 && cz === 0 && cy < canopyHeight - 1) continue;
                    if (Math.abs(cx) === canopyRadius && Math.abs(cz) === canopyRadius && rng.random() < 0.5) continue;

                    if (this.getBlock(lx, ly, lz)?.id === BlockID.Empty) {
                        this.setBlockId(lx, ly, lz, BlockID.Leaves);
                    }
                }
            }
        }
    }

    generateClouds(rng: RNG) {
        const simplex = new SimplexNoise(rng);
        const cloudHeight = this.size.height - 6;
        const cloudScale = 20;
        const cloudThreshold = 0.5;

        for (let x = 0; x < this.size.width; x++) {
            for (let z = 0; z < this.size.width; z++) {
                const worldX = this.positionInWorld.x * this.size.width + x;
                const worldZ = this.positionInWorld.z * this.size.width + z;

                const value = simplex.noise(
                    worldX / cloudScale,
                    worldZ / cloudScale
                );

                if (value > cloudThreshold) {
                    this.setBlockId(x, cloudHeight, z, BlockID.Cloud);

                    // Add some thickness
                    if (rng.random() > 0.5) {
                        this.setBlockId(x, cloudHeight - 1, z, BlockID.Cloud);
                    }
                }
            }
        }
    }

    generateResources(rng: RNG) {
        const simplex = new SimplexNoise(rng);
        for (const res of resources) {
            for (let x = 0; x < this.size.width; x++) {
                for (let y = 0; y < this.size.height; y++) {
                    for (let z = 0; z < this.size.width; z++) {
                        const worldX = this.positionInWorld.x * this.size.width + x;
                        const worldY = y;
                        const worldZ = this.positionInWorld.z * this.size.width + z;

                        const value = simplex.noise3d(
                            worldX / blocks[res.id].scale.x,
                            worldY / blocks[res.id].scale.y,
                            worldZ / blocks[res.id].scale.z
                        );

                        if (value > blocks[res.id].scarsity && this.getBlock(x, y, z)?.id === res.target) {
                            this.setBlockId(x, y, z, res.id);
                        }
                    }
                }
            }
        }
    }

    generateMeshes() {
        this.clear();
        const maxCount = this.size.width * this.size.height * this.size.width;

        const meshes: { [key: number]: THREE.InstancedMesh } = {};

        Object.values(BlockID).forEach(blockId => {
            const blockConfig = blocks[blockId as BlockID];
            if (blockId === BlockID.Empty || !blockConfig) return;

            const mesh = new THREE.InstancedMesh(geometry, blockConfig.materials as THREE.Material, maxCount);
            mesh.count = 0;
            mesh.castShadow = true;
            mesh.receiveShadow = true;
            meshes[blockId] = mesh;
        });

        const matrix = new THREE.Matrix4();
        for (let x = 0; x < this.size.width; x++) {
            for (let y = 0; y < this.size.height; y++) {
                for (let z = 0; z < this.size.width; z++) {
                    const blockId = this.getBlock(x, y, z)?.id;
                    if (blockId === BlockID.Empty || blockId === undefined) continue;

                    if (!this.isBlockObscured(x, y, z)) {
                        const mesh = meshes[blockId];
                        if (mesh) {
                            const instanceId = mesh.count;
                            matrix.setPosition(x + 0.5, y + 0.5, z + 0.5);
                            mesh.setMatrixAt(instanceId, matrix);
                            this.setBlockInstanceId(x, y, z, instanceId);
                            mesh.count++;
                        }
                    }
                }
            }
        }

        Object.values(meshes).forEach(mesh => {
            if (mesh.count > 0) {
                this.add(mesh);
            }
        });
    }

    getBlock(x: number, y: number, z: number) {
        if (x >= 0 && x < this.size.width && y >= 0 && y < this.size.height && z >= 0 && z < this.size.width) {
            return this.data[x][y][z];
        }
        return null;
    }

    setBlockId(x: number, y: number, z: number, id: number) {
        if (x >= 0 && x < this.size.width && y >= 0 && y < this.size.height && z >= 0 && z < this.size.width) {
            this.data[x][y][z].id = id;
        }
    }

    setBlockInstanceId(x: number, y: number, z: number, instanceId: number) {
        if (x >= 0 && x < this.size.width && y >= 0 && y < this.size.height && z >= 0 && z < this.size.width) {
            this.data[x][y][z].instanceId = instanceId;
        }
    }

    isBlockObscured(x: number, y: number, z: number) {
        const up = this.getBlock(x, y + 1, z)?.id ?? BlockID.Empty;
        const down = this.getBlock(x, y - 1, z)?.id ?? BlockID.Empty;
        const left = this.getBlock(x - 1, y, z)?.id ?? BlockID.Empty;
        const right = this.getBlock(x + 1, y, z)?.id ?? BlockID.Empty;
        const front = this.getBlock(x, y, z - 1)?.id ?? BlockID.Empty;
        const back = this.getBlock(x, y, z + 1)?.id ?? BlockID.Empty;

        return up !== BlockID.Empty && down !== BlockID.Empty &&
            left !== BlockID.Empty && right !== BlockID.Empty &&
            front !== BlockID.Empty && back !== BlockID.Empty;
    }
}
