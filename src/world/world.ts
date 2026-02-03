import * as THREE from "three";
import { SimplexNoise } from "three/examples/jsm/math/SimplexNoise.js";

import { type WorldSize, type WorldData, BlockID } from "./types";
import { RNG } from "./rng";
import { blocks, resources } from "./block";

const geometry = new THREE.BoxGeometry(1, 1, 1);


export class World extends THREE.Group {
    size: WorldSize;
    data: WorldData[][][];
    params = {
        seed: 0,
        terrian: {
            scale: 30,
            magnitude: 0.5,
            offset: 0.2
        }
    }
    constructor({ width = 64, height = 32 }: WorldSize) {
        super();
        this.size = { width, height };
        this.data = [];
        const rng = new RNG(this.params.seed);

        this.initTerrian();
        this.generateTerrain(rng);
        this.generateResources(rng);

        this.generateMeshes();
    }

    inBounds(x: number, y: number, z: number) {
        return (
            x >= 0 && x < this.size.width &&
            y >= 0 && y < this.size.height &&
            z >= 0 && z < this.size.width
        );
    }

    getBlock(x: number, y: number, z: number) {
        if (this.inBounds(x, y, z)) {
            return this.data[x][y][z];
        }
        return null;
    }

    setBlockId(x: number, y: number, z: number, id: number) {
        if (this.inBounds(x, y, z)) {
            this.data[x][y][z].id = id;
        }
    }

    setBlockInstanceId(x: number, y: number, z: number, instanceId: number) {
        if (this.inBounds(x, y, z)) {
            this.data[x][y][z].instanceId = instanceId;
        }
    }


    isBlockObscured(x: number, y: number, z: number) {
        const upperBlock = this.getBlock(x, y + 1, z)?.id ?? BlockID.Empty;
        const lowerBlock = this.getBlock(x, y - 1, z)?.id ?? BlockID.Empty;
        const leftBlock = this.getBlock(x - 1, y, z)?.id ?? BlockID.Empty;
        const rightBlock = this.getBlock(x + 1, y, z)?.id ?? BlockID.Empty;
        const frontBlock = this.getBlock(x, y, z - 1)?.id ?? BlockID.Empty;
        const backBlock = this.getBlock(x, y, z + 1)?.id ?? BlockID.Empty;
        return (
            upperBlock !== BlockID.Empty &&
            lowerBlock !== BlockID.Empty &&
            leftBlock !== BlockID.Empty &&
            rightBlock !== BlockID.Empty &&
            frontBlock !== BlockID.Empty &&
            backBlock !== BlockID.Empty
        );
    }


    initTerrian() {
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
                const value = simplex.noise(
                    x / this.params.terrian.scale,
                    z / this.params.terrian.scale
                );

                const scaledNoise = value * this.params.terrian.magnitude + this.params.terrian.offset;
                let height = Math.floor(this.size.height * scaledNoise);
                height = Math.max(1, Math.min(height, this.size.height - 1));
                for (let y = 0; y < this.size.height; y++) {
                    if (y < height && this.getBlock(x, y, z)?.id === BlockID.Empty) {
                        this.setBlockId(x, y, z, BlockID.Dirt);
                    } else if (y === height) {
                        this.setBlockId(x, y, z, BlockID.Grass);
                    } else if (y > height) {
                        this.setBlockId(x, y, z, BlockID.Empty);
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
                        const value = simplex.noise3d(x / blocks[res.id].scale.x, y / blocks[res.id].scale.y, z / blocks[res.id].scale.z);
                        if (value > blocks[res.id].scarsity && this.getBlock(x, y, z)?.id === res.target) {
                            this.setBlockId(x, y, z, res.id);
                        }
                    }
                }
            }
        }
    }

    isSolid(x: number, y: number, z: number) {
        return this.getBlock(x, y, z)?.id !== BlockID.Empty;
    }

    generateMeshes() {
        this.clear();
        const maxCount = this.size.width * this.size.height * this.size.width;

        // Group blocks by ID
        const meshes: { [key: number]: THREE.InstancedMesh } = {};

        Object.values(BlockID).forEach(blockId => {
            const blockConfig = blocks[blockId as BlockID];
            if (blockId === BlockID.Empty || !blockConfig) return;

            // We use a high max count for simplicity, though optimization would calculate exact counts
            const mesh = new THREE.InstancedMesh(geometry, blockConfig.materials as THREE.Material, maxCount);
            mesh.count = 0;
            mesh.castShadow = true;
            mesh.receiveShadow = true;
            meshes[blockId] = mesh;
        });

        // Add an instanced mesh for the block helpers (wireframe bounds)
        const helperMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff, wireframe: true });
        const helperMesh = new THREE.InstancedMesh(geometry, helperMaterial, maxCount);
        helperMesh.count = 0;
        this.add(helperMesh);

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
                            // Offset by 0.5 so the centered BoxGeometry aligns with
                            // the integer-grid collision that isSolid/physics uses.
                            // Block (x,y,z) occupies [x, x+1] x [y, y+1] x [z, z+1],
                            // so its visual center must be at (x+0.5, y+0.5, z+0.5).
                            matrix.setPosition(x + 0.5, y + 0.5, z + 0.5);
                            mesh.setMatrixAt(instanceId, matrix);
                            this.setBlockInstanceId(x, y, z, instanceId);
                            mesh.count++;

                            // Update helper mesh
                            helperMesh.setMatrixAt(helperMesh.count++, matrix);
                        }
                    }
                }
            }
        }

        // Add meshes to scene
        Object.values(meshes).forEach(mesh => {
            if (mesh.count > 0) {
                this.add(mesh);
            }
        });
    }
}