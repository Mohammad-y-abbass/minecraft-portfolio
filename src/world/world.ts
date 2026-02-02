import * as THREE from "three";
import { SimplexNoise } from "three/examples/jsm/math/SimplexNoise.js";

import { type WorldSize, type WorldData, BlockID } from "./types";
import { RNG } from "./rng";
import { blocks } from "./block";

const geometry = new THREE.BoxGeometry(1, 1, 1);
const material = new THREE.MeshLambertMaterial();

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
        this.initTerrian();
        this.generateTerrain();
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

    generateTerrain() {
        const rng = new RNG(this.params.seed);
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
                    y === height ? this.setBlockId(x, y, z, BlockID.Grass) : y <= height ? this.setBlockId(x, y, z, BlockID.Dirt) : this.setBlockId(x, y, z, BlockID.Empty);
                }

            }
        }
    }

    generateMeshes() {
        this.clear();
        const MAX_BLOCKS = this.size.width * this.size.height * this.size.width;
        const mesh = new THREE.InstancedMesh(geometry, material, MAX_BLOCKS);
        mesh.count = 0

        const matrix = new THREE.Matrix4();
        for (let x = 0; x < this.size.width; x++) {
            for (let y = 0; y < this.size.height; y++) {
                for (let z = 0; z < this.size.width; z++) {
                    const blockId = this.getBlock(x, y, z)?.id;
                    const instanceId = mesh.count;
                    if (blockId !== 0 && !this.isBlockObscured(x, y, z)) {
                        matrix.setPosition(x, y, z);
                        mesh.setMatrixAt(instanceId, matrix);
                        mesh.setColorAt(instanceId, new THREE.Color(blocks[blockId as BlockID].color));
                        this.setBlockInstanceId(x, y, z, instanceId);
                        mesh.count++;
                    }
                }
            }
        }
        this.add(mesh);
    }
}
